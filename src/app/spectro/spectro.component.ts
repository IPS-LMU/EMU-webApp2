import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import { DrawHelperService } from '../_services/draw-helper.service';
import { MathHelperService } from '../_services/math-helper.service';
import { FontScaleService } from '../_services/font-scale.service';
import {getMousePositionInCanvasX, getSamplesPerCanvasWidthUnit} from '../_utilities/view-state-helper-functions';
import {SpectrogramSettings} from '../_interfaces/spectrogram-settings.interface';
import {WindowType} from '../_interfaces/window-type.type';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';
import {ILevel} from '../_interfaces/annot-json.interface';

@Component({
  selector: 'app-spectro',
  templateUrl: './spectro.component.html',
  styleUrls: ['./spectro.component.scss']
})
export class SpectroComponent implements OnInit {

  private _audio_buffer: AudioBuffer;
  private _channel: number;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _selection_sample_start: number;
  private _selection_sample_end: number;
  private _preselected_item: PreselectedItemInfo;
  private _crosshair_position: number;
  private _moving_boundary_position: number;
  private _spectrogram_settings: SpectrogramSettings;
  private _mouseover_level: ILevel;
  private _main_context;
  private _markup_context: CanvasRenderingContext2D;
  private worker;
  private workerFunctionURL;

  // FFT default vars
  // default alpha for Window Function
  private alpha: number = 0.16;
  private devicePixelRatio = window.devicePixelRatio || 1;

  @Input() set spectrogram_settings(value: SpectrogramSettings) {
    this._spectrogram_settings = value;
  }

  @Input() set audio_buffer(value: AudioBuffer) {
    this._audio_buffer = value;
    console.log(value);
  }

  @Input() set channel (value: number) {
      this._channel = value;
  }

  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;
    console.log("setting _viewport_sample_start");
    // this.redraw();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;
    console.log("setting _viewport_sample_end");
    if (this._markup_context) {
      this.redraw();
    }
  }
  @Input() set selection_sample_start(value: number){
      this._selection_sample_start = value;
      console.log("setting _selection_sample_start");
      // this.redraw();
  }
  @Input() set selection_sample_end(value: number){
      this._selection_sample_end = value;
      console.log("setting _selection_sample_end");
      if(this._selection_sample_end !== 0){ // SIC this has to be done better!
       //   this.redraw();
      }
  }

  @Input() set crosshair_position (value: number) {
    this._crosshair_position = value;
    if (this._markup_context) {
        this.drawSpectMarkup();
    }
  }

  @Input() set moving_boundary_position (value: number) {
    this._moving_boundary_position = value;
    if (this._markup_context) {
      this.drawSpectMarkup();
    }
  }

  @Input() set preselected_item (value: PreselectedItemInfo) {
    this._preselected_item = value;
  }

  @Input() set mouseover_level (value: ILevel) {
    this._mouseover_level = value;
  }

  @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  @ViewChild('markupCanvas') markupCanvas: ElementRef;

  constructor() {

    let workerFunctionBlob = new Blob(['(' + this.workerFunction.toString() + ')();'], {type: 'text/javascript'});
    this.workerFunctionURL = window.URL.createObjectURL(workerFunctionBlob);
    this.worker = new Worker(this.workerFunctionURL);

  }

  ngOnInit() {

    this._main_context = this.mainCanvas.nativeElement.getContext('2d');
    this._markup_context = this.markupCanvas.nativeElement.getContext('2d');

    this.worker.onmessage = (mesg) => {
      console.log("gotmessage from spectro worker: ", mesg);
      // if (mesg.data.status.type === 'SUCCESS') {
      //   this.subj.next(mesg.data);
      // } else {
      //   this.subj.reject(mesg.data);
      // }
    };

  }

  public mousemove(event: MouseEvent){
    this.crosshair_move.emit(getMousePositionInCanvasX(event));
  }

  workerFunction() {
    let selfAny = <any>self;

    /**
     * A handy web worker to draw a spectrom (and calculate a fft)
     *
     * @version 1.2
     * @author Georg Raess <georg.raess@campus.lmu.de>
     * @link http://www.phonetik.uni-muenchen.de/
     *
     */

    ///////////////////////////////////
    // start: global vars
    selfAny.executed = false;
    selfAny.PI = 3.141592653589793; // value : Math.PI
    selfAny.TWO_PI = 6.283185307179586; // value : 2 * Math.PI
    selfAny.totalMax = 0;
    selfAny.dynRangeInDB = 50;
    selfAny.imgWidth = 0;
    selfAny.imgHeight = 0;
    selfAny.upperFreq = 0;
    selfAny.lowerFreq = 0;
    selfAny.pixelRatio = 1;
    selfAny.heatMapColorAnchors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 0]
    ];
    selfAny.samplesPerPxl = 0;
    selfAny.sampleRate = 0;
    selfAny.preEmphasisFilterFactor = 0.97;
    selfAny.transparency = 0;
    selfAny.drawHeatMapColors = false;
    selfAny.N = 0;
    selfAny.windowSizeInSecs = 0.01;
    selfAny.audioBuffer = undefined;
    selfAny.audioBufferChannels = 0;
    selfAny.wFunction = 0;
    selfAny.myFFT = undefined;
    selfAny.pixelHeight = 1;
    selfAny.internalalpha = 1;
    selfAny.maxPsd = 0;
    selfAny.HzStep = 0;
    selfAny.paint = [];
    selfAny.sin = undefined;
    selfAny.cos = undefined;
    selfAny.ceilingFreqFftIdx = 0;
    selfAny.floorFreqFftIdx = 0;
    selfAny.resultImgArr = undefined;

    // end: global vars
    //////////////////////////////////

    /////////////////////////////////
    // start: math helper functions

    // used by FFT
    selfAny.toLinearLevel = function (dbLevel) {
      return Math.pow(10, (dbLevel / 10));
    };

    // calculate decadic logarithm
    selfAny.log10 = function (arg) {
      return Math.log(arg) / 2.302585092994046; // Math.log(x) / Math.LN10
    };

    // calculate magintude
    selfAny.magnitude = function (real, imag) {
      return Math.sqrt((real * real) + (imag * imag));
    };

    // end: math helper functions
    ////////////////////////////////

    ///////////////////////////////////////////////////
    // start: FFT class (incl. fft() function itself)

    selfAny.FFT = function () {
      let m, i, x;
      let n = selfAny.N;
      m = parseInt(String(Math.log(n) / 0.6931471805599453), 10);
      if (n !== (1 << m)) { // Make sure n is a power of 2
        // console.log('ERROR : FFT length must be power of 2');
      }
      if (selfAny.cos === undefined || n !== selfAny.N) {

        // this means that the following is only executed
        // when no COS table exists
        // or n changes

        selfAny.cos = new Float32Array(n / 2); // precompute cos table
        for (x = 0; x < n / 2; x++) {
          selfAny.cos[x] = Math.cos(-2 * selfAny.PI * x / n);
        }
      }
      if (selfAny.sin === undefined || n !== selfAny.N) {

        // this means that the following is only executed
        // when no COS table exists
        // or n changes

        selfAny.sin = new Float32Array(n / 2); // precompute sin table
        for (x = 0; x < n / 2; x++) {
          selfAny.sin[x] = Math.sin(-2 * selfAny.PI * x / n);
        }
      }

      /**
       * apply window function and pre-emphasis from idx 0 to length
       * in buffer given
       *
       * @param type is the chosen window Function as enum
       * @param alpha is the alpha value for Window Functions (default 0.16)
       * @param buffer is the zero padded magnitude spectrum
       * @param length is the length to in the buffer (starting at idx 0)
       * to which to apply the window to. If the buffer is [x0, x1, x2, x4] and
       * length is 2 the window will be applied to [x0, x1, x2] this is needed
       * to only apply function to non-zero-padded values of magnitude spectrum.
       * @return the windowed/pre-emphasised buffer
       */
      this.applyWindowFuncAndPreemph = function (type: WindowType, alpha, buffer, length) {
        // var length = buffer.length;
        this.alpha = alpha;
        switch (type) {
          case 'BARTLETT':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionBartlett(length, i);
            }
            break;
          case 'BARTLETTHANN':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionBartlettHann(length, i);
            }
            break;
          case 'BLACKMAN':
            this.alpha = this.alpha || 0.16;
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionBlackman(length, i, alpha);
            }
            break;
          case 'COSINE':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionCosine(length, i);
            }
            break;
          case 'GAUSS':
            this.alpha = this.alpha || 0.25;
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionGauss(length, i, alpha);
            }
            break;
          case 'HAMMING':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionHamming(length, i);
            }
            break;
          case 'HANN':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionHann(length, i);
            }
            break;
          case 'LANCZOS':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionLanczos(length, i);
            }
            break;
          case 'RECTANGULAR':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionRectangular(length, i);
            }
            break;
          case 'TRIANGULAR':
            for (i = 0; i < length; i++) {
              if (i > 0) {
                buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
              }
              buffer[i] *= this.wFunctionTriangular(length, i);
            }
            break;
        }
        return buffer;
      };
      ////////////////////////////////////
      // start: the windowing functions

      this.wFunctionBartlett = function (length, index) {
        return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
      };

      this.wFunctionBartlettHann = function (length, index) {
        return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(selfAny.TWO_PI * index / (length - 1));
      };

      this.wFunctionBlackman = function (length, index, alpha) {
        let a0 = (1 - alpha) / 2;
        let a1 = 0.5;
        let a2 = alpha / 2;
        return a0 - a1 * Math.cos(selfAny.TWO_PI * index / (length - 1)) + a2 * Math.cos(4 * selfAny.PI * index / (length - 1));
      };

      this.wFunctionCosine = function (length, index) {
        return Math.cos(selfAny.PI * index / (length - 1) - selfAny.PI / 2);
      };

      this.wFunctionGauss = function (length, index, alpha) {
        return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
      };

      this.wFunctionHamming = function (length, index) {
        return 0.54 - 0.46 * Math.cos(selfAny.TWO_PI * index / (length - 1));
      };

      this.wFunctionHann = function (length, index) {
        return 0.5 * (1 - Math.cos(selfAny.TWO_PI * index / (length - 1)));
      };

      this.wFunctionLanczos = function (length, index) {
        let x = 2 * index / (length - 1) - 1;
        return Math.sin(selfAny.PI * x) / (selfAny.PI * x);
      };

      this.wFunctionRectangular = function () {
        return 1;
      };

      this.wFunctionTriangular = function (length, index) {
        return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
      };
      // end: the windowing functions
      ///////////////////////////////////

      /**
       * calculate and apply according pre-emphasis on sample
       */
      this.applyPreEmph = function (curSample, prevSample) {
        return curSample - selfAny.preEmphasisFilterFactor * prevSample;
      };

      // the FFT calculation
      this.fft = function (x, y) {
        // Bit-reverse
        let i, j, k, n1, n2, a, c, s, t1, t2;
        // Bit-reverse
        j = 0;
        n2 = n / 2;
        for (i = 1; i < n - 1; i++) {
          n1 = n2;
          while (j >= n1) {
            j = j - n1;
            n1 = n1 / 2;
          }
          j = j + n1;

          if (i < j) {
            t1 = x[i];
            x[i] = x[j];
            x[j] = t1;
            t1 = y[i];
            y[i] = y[j];
            y[j] = t1;
          }
        }

        // FFT
        n1 = 0;
        n2 = 1;

        for (i = 0; i < m; i++) {
          n1 = n2;
          n2 = n2 + n2;
          a = 0;

          for (j = 0; j < n1; j++) {
            c = selfAny.cos[a];
            s = selfAny.sin[a];
            a += 1 << (m - i - 1);

            for (k = j; k < n; k = k + n2) {
              t1 = c * x[k + n1] - s * y[k + n1];
              t2 = s * x[k + n1] + c * y[k + n1];
              x[k + n1] = x[k] - t1;
              y[k + n1] = y[k] - t2;
              x[k] = x[k] + t1;
              y[k] = y[k] + t2;
            }
          }
        }
      };
    };

    // end: FFT class
    ///////////////////

    /////////////////////////////////
    // start: rendering function

    /**
     * interpolates a 3D color space and calculate accoring
     * value on that plane
     *
     * @param minval is the minimum value to map to (number)
     * @param maxval is the maximum value to map to (number)
     * @param val is the value itself (number)
     * @param colors is an array of arrays containing the colors
     * to interpol. against (of the form: [[255, 0, 0],[0, 255, 0],[0, 0, 255]])
     */
    selfAny.convertToHeatmap = function (minval, maxval, val, colors) {
      let maxIndex = colors.length - 1;
      let v = (val - minval) / (maxval - minval) * maxIndex;
      let i1 = Math.floor(v);
      let i2 = Math.min.apply(null, [Math.floor(v) + 1, maxIndex]);
      let rgb1 = colors[i1];
      let rgb2 = colors[i2];
      let f = v - i1;
      return ({
        'r': Math.floor(rgb1[0] + f * (rgb2[0] - rgb1[0])),
        'g': Math.floor(rgb1[1] + f * (rgb2[1] - rgb1[1])),
        'b': Math.floor(rgb1[2] + f * (rgb2[2] - rgb1[2]))
      });
    };


    /**
     * draws a single line of the spectrogram into the imageResult array.
     * by calculating the RGB value of the current pixel with:
     * 255-(255*scaled)
     * @param xIdx in the global.paint array
     */
    selfAny.drawVerticalLineOfSpectogram = function (xIdx) {

      // set upper boundary for linear interpolation
      let x1 = selfAny.pixelHeight;
      let rgb, index, px, py;

      // value for first interpolation at lower boundry (height=0)

      // calculate the one sided power spectral density PSD (f, t) in Pa2/Hz
      // PSD(f) proportional to 2|X(f)|2 / (t2 - t1)
      let psd = (2 * Math.pow(selfAny.paint[xIdx][1], 2)) / selfAny.N;
      let psdLog = 10 * selfAny.log10(psd / selfAny.maxPsd);
      let scaledVal = ((psdLog + selfAny.dynRangeInDB) / selfAny.dynRangeInDB);
      if (scaledVal > 1) {
        scaledVal = 1;
      } else if (scaledVal < 0) {
        scaledVal = 0;
      }

      for (let i = 0; i < selfAny.paint[xIdx].length; i++) {

        let y0 = scaledVal; // !!!! set y0 to previous scaled value

        // for each value in paint[] calculate pixelHeight interpolation points
        // x0=0
        // x1=pixelHeight
        // if(paint[i-1]<0) paint[i-1] = 1
        // y0=paint[i-1]
        // y1=paint[i]


        // !!!! calculate next scaledValue [0...1]
        psd = (2 * Math.pow(selfAny.paint[xIdx][i], 2)) / selfAny.N;
        psdLog = 10 * selfAny.log10(psd / selfAny.maxPsd);
        scaledVal = ((psdLog + selfAny.dynRangeInDB) / selfAny.dynRangeInDB);
        if (scaledVal > 1) {
          scaledVal = 1;
        }
        if (scaledVal < 0) {
          scaledVal = 0;
        }

        // !!!! set y1 to this scaled value
        let y1 = scaledVal;

        if (selfAny.pixelHeight >= 1) {
          // do interpolation between y0 (previous scaledValue) and y1 (scaledValue now)
          for (let b = 0; b < selfAny.pixelHeight; b++) {
            let y2 = y0 + (y1 - y0) / x1 * b;

            // calculate corresponding color value for interpolation point [0...255]
            rgb = 255 - Math.round(255 * y2);

            // set internal image buffer to calculated & interpolated value
            px = Math.floor(xIdx);
            py = Math.floor(selfAny.imgHeight - (selfAny.pixelHeight * (i - 2) + b));

            index = (px + (py * selfAny.imgWidth)) * 4;
            if (selfAny.drawHeatMapColors) {
              if (!isNaN(rgb)) {
                let hmVals = selfAny.convertToHeatmap(0, 255, rgb, selfAny.heatMapColorAnchors);
                selfAny.resultImgArr[index + 0] = hmVals.r;
                selfAny.resultImgArr[index + 1] = hmVals.g;
                selfAny.resultImgArr[index + 2] = hmVals.b;
                selfAny.resultImgArr[index + 3] = selfAny.transparency;

              } else {
                selfAny.resultImgArr[index + 0] = rgb;
                selfAny.resultImgArr[index + 1] = rgb;
                selfAny.resultImgArr[index + 2] = rgb;
                selfAny.resultImgArr[index + 3] = selfAny.transparency;
              }

            } else {
              selfAny.resultImgArr[index + 0] = rgb;
              selfAny.resultImgArr[index + 1] = rgb;
              selfAny.resultImgArr[index + 2] = rgb;
              selfAny.resultImgArr[index + 3] = selfAny.transparency;
            }
          }
        } else {
          rgb = 255 - Math.round(255 * y1);
          // set internal image buffer to calculated & interpolated value
          px = Math.floor(xIdx);
          py = Math.floor(selfAny.imgHeight - (selfAny.pixelHeight * (i - 2)));

          index = (px + (py * selfAny.imgWidth)) * 4;
          selfAny.resultImgArr[index + 0] = rgb;
          selfAny.resultImgArr[index + 1] = rgb;
          selfAny.resultImgArr[index + 2] = rgb;
          selfAny.resultImgArr[index + 3] = selfAny.transparency;
        }
      }
    };


    /**
     * calculates Magnitude by
     * - reading the current (defined with offset) data from localSoundBuffer
     * - applying the current Window Function to the selected data
     * - calculating the actual FFT
     * - (and saving the biggest value in totalMax)
     *
     * @param offset calculated offset in PCM Stream
     * @param windowSizeInSamples size of window in samples (actual samples -> not FFT length; rest zero-padded)
     * @return magnitude spectrum as Float32Array
     */
    selfAny.calcMagnitudeSpectrum = function (offset, windowSizeInSamples) {
      // imaginary array of length N
      let imag = new Float32Array(selfAny.N);

      // real array of length N
      let real = new Float32Array(selfAny.N);

      // result array of length c - d
      let result = new Float32Array(selfAny.ceilingFreqFftIdx - selfAny.floorFreqFftIdx);

      // set real values by reading local sound buffer (this auto zeropads everything > windowSizeInSamples)
      for (let j = 0; j < windowSizeInSamples; j++) {
        real[j] = selfAny.audioBuffer[offset + j];
      }
      // apply window function and pre-emphasis to non zero padded real
      selfAny.myFFT.applyWindowFuncAndPreemph(selfAny.wFunction, selfAny.internalalpha, real, windowSizeInSamples);

      // calculate FFT over real and save to result
      selfAny.myFFT.fft(real, imag);

      // calculate magnitude for each spectral component
      for (let low = 0; low <= selfAny.ceilingFreqFftIdx - selfAny.floorFreqFftIdx; low++) {
        result[low] = selfAny.magnitude(real[low + selfAny.floorFreqFftIdx], imag[low + selfAny.floorFreqFftIdx]);
        if (selfAny.totalMax < result[low]) {
          selfAny.totalMax = result[low];
        }
      }

      return result;
    };

    /**
     * initial function call for calculating and drawing Spectrogram
     * input sample data comes from the buffer global.audioBuffer
     * - first loop calculates magnitude spectra to draw (calcMagnitudeSpectrum())
     * - second loop draws these values into the global.resultImgArr (drawVerticalLineOfSpectogram())
     */
    selfAny.renderSpectrogram = function () {

      if (!selfAny.executed) {
        // start execution once
        selfAny.executed = true;

        let windowSizeInSamples = selfAny.sampleRate * selfAny.windowSizeInSecs;

        // instance of FFT with windowSize N
        selfAny.myFFT = new selfAny.FFT();

        // array holding FFT results paint[canvas width][canvas height]
        selfAny.paint = new Array(selfAny.imgWidth);

        // Hz per pixel height
        selfAny.HzStep = (selfAny.sampleRate / 2) / (selfAny.N / 2);


        // upper Hz boundary to display
        selfAny.ceilingFreqFftIdx = Math.ceil(selfAny.upperFreq / selfAny.HzStep);

        // lower Hz boundary to display
        selfAny.floorFreqFftIdx = Math.floor(selfAny.lowerFreq / selfAny.HzStep); // -1 for value below display when lower>0

        // height between two interpolation points
        selfAny.pixelHeight = selfAny.imgHeight / (selfAny.ceilingFreqFftIdx - selfAny.floorFreqFftIdx - 2);

        // ugly hack in order to support PhantomJS < 2.0 testing
        // if (typeof Uint8ClampedArray === 'undefined') {
        //   Uint8ClampedArray = Uint8Array;
        // }

        // create new picture
        selfAny.resultImgArr = new Uint8ClampedArray(Math.ceil(selfAny.imgWidth * selfAny.imgHeight * 4));

        // calculate i FFT runs, save result into paint and set maxPsd while doing so
        for (let i = 0; i < selfAny.imgWidth; i++) {
          selfAny.paint[i] = selfAny.calcMagnitudeSpectrum(Math.round(i * selfAny.samplesPerPxl), windowSizeInSamples);
          selfAny.maxPsd = (2 * Math.pow(selfAny.totalMax, 2)) / selfAny.N;
        }

        // draw spectrogram on png image with canvas width
        // one column is drawn per drawVerticalLineOfSpectogram
        for (let j = 0; j < selfAny.imgWidth; j++) {
          selfAny.drawVerticalLineOfSpectogram(j);
        }
        // post generated image block with settings back
        selfAny.postMessage({
          'window': selfAny.wFunction,
          'samplesPerPxl': selfAny.samplesPerPxl,
          'pixelHeight': selfAny.pixelHeight,
          'pixelRatio': selfAny.pixelRatio,
          'width': selfAny.imgWidth,
          'height': selfAny.imgHeight,
          'img': selfAny.resultImgArr.buffer
        }, [selfAny.resultImgArr.buffer]);

        // free vars
        selfAny.myFFT = null;

        // stop execution
        selfAny.executed = false;
      }
    };

    // end: rendering function
    //////////////////////////////

    //////////////////////////
    // communication functions


    /**
     * function to handle messages events
     * @param e message event
     */
    selfAny.onmessage = function (e) {
      console.log(e);
      if (e.data !== undefined) {
        let render = true;
        let renderError = '';
        let data = e.data;
        if (data.windowSizeInSecs !== undefined) {
          selfAny.windowSizeInSecs = data.windowSizeInSecs;
        } else {
          renderError = 'windowSizeInSecs';
          render = false;
        }
        if (data.fftN !== undefined) {
          selfAny.N = data.fftN;
        } else {
          renderError = 'fftN';
          render = false;
        }
        if (data.alpha !== undefined) {
          selfAny.internalalpha = data.alpha;
        } else {
          renderError = 'alpha';
          render = false;
        }
        if (data.upperFreq !== undefined) {
          selfAny.upperFreq = data.upperFreq;
        } else {
          renderError = 'upperFreq';
          render = false;
        }
        if (data.lowerFreq !== undefined) {
          selfAny.lowerFreq = data.lowerFreq;
        } else {
          renderError = 'lowerFreq';
          render = false;
        }
        if (data.samplesPerPxl !== undefined) {
          selfAny.samplesPerPxl = data.samplesPerPxl;
        } else {
          renderError = 'samplesPerPxl';
          render = false;
        }
        if (data.window !== undefined) {
          selfAny.wFunction = data.window;
        } else {
          renderError = 'window';
          render = false;
        }
        if (data.imgWidth !== undefined) {
          selfAny.imgWidth = data.imgWidth;
        } else {
          renderError = 'imgWidth';
          render = false;
        }
        if (data.imgHeight !== undefined) {
          selfAny.imgHeight = data.imgHeight;
        } else {
          renderError = 'imgHeight';
          render = false;
        }
        if (data.dynRangeInDB !== undefined) {
          selfAny.dynRangeInDB = data.dynRangeInDB;
        } else {
          renderError = 'dynRangeInDB';
          render = false;
        }
        if (data.pixelRatio !== undefined) {
          selfAny.pixelRatio = data.pixelRatio;
        } else {
          renderError = 'pixelRatio';
          render = false;
        }
        if (data.sampleRate !== undefined) {
          selfAny.sampleRate = data.sampleRate;
        } else {
          renderError = 'sampleRate';
          render = false;
        }
        if (data.audioBufferChannels !== undefined) {
          selfAny.audioBufferChannels = data.audioBufferChannels;
        } else {
          renderError = 'audioBufferChannels';
          render = false;
        }
        if (data.transparency !== undefined) {
          selfAny.transparency = data.transparency;
        } else {
          renderError = 'transparency';
          render = false;
        }
        if (data.audioBuffer !== undefined) {
          selfAny.audioBuffer = new Float32Array(data.audioBuffer);
        } else {
          renderError = 'audioBuffer';
          render = false;
        }
        if (data.drawHeatMapColors !== undefined) {
          selfAny.drawHeatMapColors = data.drawHeatMapColors;
        } else {
          renderError = 'drawHeatMapColors';
          render = false;
        }
        if (data.preEmphasisFilterFactor !== undefined) {
          selfAny.preEmphasisFilterFactor = data.preEmphasisFilterFactor;
        } else {
          renderError = 'preEmphasisFilterFactor';
          render = false;
        }
        if (data.heatMapColorAnchors !== undefined) {
          selfAny.heatMapColorAnchors = data.heatMapColorAnchors;
        } else {
          renderError = 'heatMapColorAnchors';
          render = false;
        }
        if (render) {
          selfAny.renderSpectrogram();
        } else {
          selfAny.postMessage({
            'status': {
              'type': 'ERROR',
              'message': renderError + ' is undefined'
            }
          });
        }
      } else {
        selfAny.postMessage({
          'status': {
            'type': 'ERROR',
            'message': 'Undefined message was sent to spectroDrawingWorker'
          }
        });
      }
    };


  // get a blob url for the worker script from the worker script text
  // getWorkerURL: function () {
  //   let blob, urlObj;
  //   try {
  //     blob = new Blob([this.getWorkerScript()], {type: 'application/javascript'});
  //   } catch (e) { // Backwards-compatibility
  //     window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
  //     blob = new BlobBuilder();
  //     blob.append(SpectroDrawingWorker);
  //     blob = blob.getBlob();
  //   }
  //   if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
  //     urlObj = webkitURL.createObjectURL(blob);
  //   } else {
  //     urlObj = URL.createObjectURL(blob);
  //   }
  //   return urlObj;
  // },

  // kill the spectroDrawingWorker
  // kill: function () {
  //   if (this.worker) {
  //     this.worker.terminate();
  //   }
  //   if (this.url) {
  //     if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
  //       webkitURL.revokeObjectURL(this.url);
  //     } else {
  //       URL.revokeObjectURL(this.url);
  //     }
  //   }
  // },

  // say something to the spectroDrawingWorker
  // tell: function (msg) {
  //   if (this.worker) {
  //     this.worker.postMessage(msg);
  //   }
  // },

  // listen for the spectroDrawingWorker to talk back
  // says: function (handler) {
  //   if (this.worker) {
  //     this.worker.addEventListener('message', function (e) {
  //       handler(e.data);
  //     });
  //   }
  // }

  }

//   scope.shs = Soundhandlerservice;
//   scope.order = attrs.order;
//   scope.vs = viewState;
//   scope.cps = ConfigProviderService;
//   scope.dhs = Drawhelperservice;
//   scope.lmds = loadedMetaDataService;
//   scope.trackName = attrs.trackName;
//   // select the needed DOM elements from the template
//   scope.canvas0 = element.find('canvas')[0];
//   scope.canvas1 = element.find('canvas')[element.find('canvas').length - 1];
//   scope.context = scope.canvas0.getContext('2d');
//   scope.markupCtx = scope.canvas1.getContext('2d');
//
//   // FFT default vars
//   // default alpha for Window Function
//   scope.alpha = 0.16;
//   scope.devicePixelRatio = window.devicePixelRatio || 1;
//
//   // Spectro Worker
//   scope.woker = new SpectroDrawingWorker();
//
//
//   ///////////////
//   // watches
//
//   //
//   scope.$watch('vs.timelineSize', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         $timeout(scope.clearAndDrawSpectMarkup, ConfigProviderService.design.animation.duration);
//       }
//     }
//   });
//
//   //
//   scope.$watch('viewState.lastUpdate', function (newValue, oldValue) {
//     if (newValue !== oldValue && !$.isEmptyObject(scope.shs) && !$.isEmptyObject(scope.shs.audioBuffer)) {
//       scope.clearAndDrawSpectMarkup();
//     }
//   });
//
//
//   scope.$watch('vs.submenuOpen', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         $timeout(scope.clearAndDrawSpectMarkup, ConfigProviderService.design.animation.duration);
//       }
//     }
//   });
//
//
//   scope.$watch('vs.curViewPort', function (newValue, oldValue) {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         // check for changed zoom
//         if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
//           scope.redraw();
//         }
//         scope.clearAndDrawSpectMarkup();
//       }
//     }
//   }, true);
//
//   scope.$watch('vs.movingBoundarySample', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         scope.clearAndDrawSpectMarkup();
//       }
//     }
//   }, true);
//
//   scope.$watch('vs.movingBoundary', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         // scope.redraw();
//         scope.clearAndDrawSpectMarkup();
//       }
//     }
//   }, true);
//
//   scope.$watch('vs.curMouseX', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         // scope.redraw();
//         // only draw corsshair x line if mouse currently not over canvas
//         if(scope.vs.curMouseTrackName !== scope.trackName){
//           scope.clearAndDrawSpectMarkup();
//         }
//       }
//     }
//   }, true);
//
//
//   scope.$watch('vs.spectroSettings', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         scope.setupEvent();
//         scope.redraw();
//       }
//     }
//   }, true);
//
//   //
//   scope.$watch('vs.osciSettings', function () {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         scope.setupEvent();
//         scope.redraw();
//       }
//     }
//   }, true);
//
//
//   //
//   scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
//     if (!$.isEmptyObject(scope.shs)) {
//       if (!$.isEmptyObject(scope.shs.audioBuffer)) {
//         if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
//           scope.redraw();
//         }
//       }
//     }
//   }, true);
//
//

  ///////////////
  // bindings

  redraw() {
    this.drawSpectMarkup();
    this.drawSpectro(this._audio_buffer.getChannelData(this._channel));
  }

  drawSpectro(buffer) {
    this.killSpectroRenderingThread();
    this.startSpectroRenderingThread(buffer);
  }

//   scope.clearAndDrawSpectMarkup = function () {
//     scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
//     scope.drawSpectMarkup();
//   };

  drawSpectMarkup() {
    this._markup_context.clearRect(0, 0, this.markupCanvas.nativeElement.width, this.markupCanvas.nativeElement.height);

    // draw moving boundary line if moving
    if (this._moving_boundary_position) {
      DrawHelperService.drawMovingBoundaryLine(
          this._markup_context,
          this._viewport_sample_start,
          this._viewport_sample_end,
          this._moving_boundary_position,
          this._preselected_item.isLast,
          this._mouseover_level
      );
    }

    // draw current viewport selected
    DrawHelperService.drawCurViewPortSelected(
        this._markup_context,
        false,
        this._viewport_sample_start,
        this._viewport_sample_end,
        this._selection_sample_start,
        this._selection_sample_end,
        this._audio_buffer,
        this._mouseover_level
    );
    // draw min max vals and name of track
    DrawHelperService.drawMinMaxAndName(this._markup_context, '', this._spectrogram_settings.rangeFrom, this._spectrogram_settings.rangeTo, 2);
    DrawHelperService.drawCrossHairX(this._markup_context, this._crosshair_position);

  }

  killSpectroRenderingThread() {
    this._main_context.fillStyle = 'lightgrey'; //ConfigProviderService.design.color.lightGrey;
    this._main_context.fillRect(0, 0, this.markupCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    // draw current viewport selected
    DrawHelperService.drawCurViewPortSelected(
        this._markup_context,
        false,
        this._viewport_sample_start,
        this._viewport_sample_end,
        this._selection_sample_start,
        this._selection_sample_end,
        this._audio_buffer,
        this._mouseover_level
    );
    FontScaleService.drawUndistortedText(this._main_context, 'rendering...', 12 * 0.75, 'HelveticaNeue', 10, 50, 'black', true);
    if (this.worker !== null) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  setupEvent() {
    let imageData = this._main_context.createImageData(this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    this.worker.onmessage = (event) => {
      if (event.data.status === undefined) {
        const samplesPerPxl = getSamplesPerCanvasWidthUnit(
            this._viewport_sample_start,
            this._viewport_sample_end,
            this.mainCanvas.nativeElement
        );
        if (samplesPerPxl === event.data.samplesPerPxl) {
          let tmp = new Uint8ClampedArray(event.data.img);
          imageData.data.set(tmp);
          this._main_context.putImageData(imageData, 0, 0);
          this.drawSpectMarkup();
        }
      } else {
        console.error('Error rendering spectrogram:', event.data.status.message);
      }
    };
  };

  startSpectroRenderingThread(buffer) {
    if (buffer.length > 0) {
      // this.worker = new SpectroDrawingWorker();
      this.worker = new Worker(this.workerFunctionURL);

      let parseData: any = [];
      let fftN = MathHelperService.calcClosestPowerOf2Gt(this._audio_buffer.sampleRate * this._spectrogram_settings.windowSizeInSecs);
      // fftN must be greater than 512 (leads to better resolution of spectrogram)
      if (fftN < 512) {
        fftN = 512;
      }
      // extract relavant data
      parseData = buffer.slice(this._viewport_sample_start, this._viewport_sample_end);

      let leftPadding: any = [];
      let rightPadding: any = [];

      // check if any zero padding at LEFT edge is necessary
      let windowSizeInSamples = this._audio_buffer.sampleRate * this._spectrogram_settings.windowSizeInSecs;
      if (this._viewport_sample_start < windowSizeInSamples / 2) {
        //should do something here... currently always padding with zeros!
      } else {
        leftPadding = buffer.slice(this._viewport_sample_start - windowSizeInSamples / 2, this._viewport_sample_start);
      }
      // check if zero padding at RIGHT edge is necessary
      if (this._viewport_sample_end + fftN / 2 - 1 >= this._audio_buffer.length) {
        //should do something here... currently always padding with zeros!
      } else {
        rightPadding = buffer.slice(this._viewport_sample_end, this._viewport_sample_end + fftN / 2 - 1);
      }
      // add padding
      let paddedSamples = new Float32Array(leftPadding.length + parseData.length + rightPadding.length);
      paddedSamples.set(leftPadding);
      paddedSamples.set(parseData, leftPadding.length);
      paddedSamples.set(rightPadding, leftPadding.length + parseData.length);

      // if (this.view_state_service.curViewPort.sS >= fftN / 2) {
      //   // pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
      //   parseData = ArrayBufferHelperService.subarray(buffer,this.view_state_service.curViewPort.sS - fftN / 2, this.view_state_service.curViewPort.eS + fftN);
      // } else {
      //   // tolerate window/2 alignment issue if at beginning of file
      //   parseData = ArrayBufferHelperService.subarray(buffer, this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS + fftN);
      // }
      this.setupEvent();
      // console.log(paddedSamples.buffer);
      this.worker.postMessage({
        'windowSizeInSecs': this._spectrogram_settings.windowSizeInSecs,
        'fftN': fftN,
        'alpha': this.alpha,
        'upperFreq': this._spectrogram_settings.rangeTo,
        'lowerFreq': this._spectrogram_settings.rangeFrom,
        'samplesPerPxl': getSamplesPerCanvasWidthUnit(
            this._viewport_sample_start,
            this._viewport_sample_end,
            this.mainCanvas.nativeElement
        ),
        'window': this._spectrogram_settings.window,
        'imgWidth': this.mainCanvas.nativeElement.width,
        'imgHeight': this.mainCanvas.nativeElement.height,
        'dynRangeInDB': this._spectrogram_settings.dynamicRange,
        'pixelRatio': this.devicePixelRatio,
        'sampleRate': this._audio_buffer.sampleRate,
        'transparency': this._spectrogram_settings.transparency,
        'audioBuffer': paddedSamples.buffer,
        'audioBufferChannels': this._audio_buffer.numberOfChannels,
        'drawHeatMapColors': this._spectrogram_settings.drawHeatMapColors,
        'preEmphasisFilterFactor': this._spectrogram_settings.preEmphasisFilterFactor,
        'heatMapColorAnchors': this._spectrogram_settings.heatMapColorAnchors
      }, [paddedSamples.buffer]);
    }
  };
}
