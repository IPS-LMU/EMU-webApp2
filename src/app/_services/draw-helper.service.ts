import { MathHelperService } from './math-helper.service';
import { FontScaleService } from './font-scale.service';
import {
    calculateSampleTime,
    getPixelDistanceBetweenSamples,
    getPixelPositionOfSampleInViewport,
    getSampleAtPixelPositionInViewport
} from '../_utilities/view-state-helper-functions';
import {ILevel} from '../_interfaces/annot-json.interface';

export class DrawHelperService {

  private static getScale(ctx, str, scale) {
    return ctx.measureText(str).width * scale;
  }

  private static getScaleWidth(ctx, str1, str2, scaleX) {
    if (str1 !== undefined && str1.toString().length > str2.toString().length) {
      return DrawHelperService.getScale(ctx, str1, scaleX);
    } else {
      return DrawHelperService.getScale(ctx, str2, scaleX);
    }
  }

  /**
   *
   */
  public static calculateOsciPeaks(audioBuffer: AudioBuffer) {
    let sampleRate = audioBuffer.sampleRate;
    let numberOfChannels = audioBuffer.numberOfChannels;

    // TODO mix all channels

    // calculate 3 peak levels (inspired by http://www.reaper.fm/sdk/reapeaks.txt files)
    //   1. At approximately 400 peaks/sec (divfactor 110 at 44khz)
    let winSize0 = sampleRate / 400;
    //   2. At approximately 10 peaks/sec (divfactor 4410 at 44khz)
    let winSize1 = sampleRate / 10;
    //   3. At approximately 1 peaks/sec (divfactor 44100 at 44khz)
    let winSize2 = sampleRate / 1;

    // set initial result values
    const osciPeaks = {
      'numberOfChannels': numberOfChannels,
      'sampleRate': sampleRate,
      'winSizes': [winSize0, winSize1, winSize2],
      'channelOsciPeaks': []
    };


    //////////////////////////
    // go through channels

    for(let channelIdx = 0; channelIdx < numberOfChannels; channelIdx++){

      let curChannelSamples = audioBuffer.getChannelData(channelIdx);

      // preallocate min max peaks arrays
      let curChannelMaxPeaksWinSize0 = new Float32Array(Math.round(audioBuffer.length / winSize0));
      let curChannelMinPeaksWinSize0 = new Float32Array(Math.round(audioBuffer.length / winSize0));

      let curChannelMaxPeaksWinSize1 = new Float32Array(Math.round(audioBuffer.length / winSize1));
      let curChannelMinPeaksWinSize1 = new Float32Array(Math.round(audioBuffer.length / winSize1));

      let curChannelMaxPeaksWinSize2 = new Float32Array(Math.round(audioBuffer.length / winSize2));
      let curChannelMinPeaksWinSize2 = new Float32Array(Math.round(audioBuffer.length / winSize2));

      let curWindowIdxCounterWinSize0 = 0;
      let curPeakIdxWinSize0 = 0;
      let winMinPeakWinSize0 = Infinity;
      let winMaxPeakWinSize0 = -Infinity;

      let curWindowIdxCounterWinSize1 = 0;
      let curPeakIdxWinSize1 = 0;
      let winMinPeakWinSize1 = Infinity;
      let winMaxPeakWinSize1 = -Infinity;

      let curWindowIdxCounterWinSize2 = 0;
      let curPeakIdxWinSize2 = 0;
      let winMinPeakWinSize2 = Infinity;
      let winMaxPeakWinSize2 = -Infinity;


      for(let sampleIdx = 0; sampleIdx <= curChannelSamples.length; sampleIdx++){

        ///////////////////////////
        // check if largest/smallest in window

        // winSize0
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize0){
          winMaxPeakWinSize0 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize0){
          winMinPeakWinSize0 = curChannelSamples[sampleIdx];
        }

        // winSize1
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize1){
          winMaxPeakWinSize1 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize1){
          winMinPeakWinSize1 = curChannelSamples[sampleIdx];
        }

        // winSize2
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize2){
          winMaxPeakWinSize2 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize2){
          winMinPeakWinSize2 = curChannelSamples[sampleIdx];
        }

        ////////////////////////////
        // add to peaks array

        // winSize0
        if(curWindowIdxCounterWinSize0 === Math.round(winSize0)){
          curChannelMaxPeaksWinSize0[curPeakIdxWinSize0] = winMaxPeakWinSize0;
          curChannelMinPeaksWinSize0[curPeakIdxWinSize0] = winMinPeakWinSize0;
          curPeakIdxWinSize0 += 1;
          // reset win vars
          curWindowIdxCounterWinSize0 = 0;
          winMinPeakWinSize0 = Infinity;
          winMaxPeakWinSize0 = -Infinity;
        }

        // winSize1
        if(curWindowIdxCounterWinSize1 === Math.round(winSize1)){
          curChannelMaxPeaksWinSize1[curPeakIdxWinSize1] = winMaxPeakWinSize1;
          curChannelMinPeaksWinSize1[curPeakIdxWinSize1] = winMinPeakWinSize1;
          curPeakIdxWinSize1 += 1;
          // reset win vars
          curWindowIdxCounterWinSize1 = 0;
          winMinPeakWinSize1 = Infinity;
          winMaxPeakWinSize1 = -Infinity;
        }

        // winSize2
        if(curWindowIdxCounterWinSize2 === Math.round(winSize2)){
          curChannelMaxPeaksWinSize2[curPeakIdxWinSize2] = winMaxPeakWinSize2;
          curChannelMinPeaksWinSize2[curPeakIdxWinSize2] = winMinPeakWinSize2;
          curPeakIdxWinSize2 += 1;
          // reset win vars
          curWindowIdxCounterWinSize2 = 0;
          winMinPeakWinSize2 = Infinity;
          winMaxPeakWinSize2 = -Infinity;
        }

        curWindowIdxCounterWinSize0 += 1;
        curWindowIdxCounterWinSize1 += 1;
        curWindowIdxCounterWinSize2 += 1;
      }

      osciPeaks.channelOsciPeaks[channelIdx] = {
        'maxPeaks': [curChannelMaxPeaksWinSize0, curChannelMaxPeaksWinSize1, curChannelMaxPeaksWinSize2],
        'minPeaks': [curChannelMinPeaksWinSize0, curChannelMinPeaksWinSize1, curChannelMinPeaksWinSize2]
      };

    }

    return osciPeaks;
  }


  /**
   * get current peaks to be drawn
   * if drawing over sample exact -> samples
   * if multiple samples per pixel -> calculate envelope points
   * @param canvas canvas object used to get width
   * @param data samples as arraybuffer
   * @param sS start sample
   * @param eS end sample
   */
  public static calculatePeaks = function (canvas, data, sS, eS) {

    let samplePerPx = (eS + 1 - sS) / canvas.width; // samples per pixel + one to correct for subtraction
    // var numberOfChannels = 1; // hardcode for now...
    // init result values for over sample exact
    let samples = [];
    let minSamples;
    let maxSamples;
    // init result values for envelope
    let maxPeaks: any = {};
    let minPeaks: any = {};
    let minMinPeak = Infinity;
    let maxMaxPeak = -Infinity;

    let winStartSample;
    let winEndSample;
    let winMinPeak = Infinity;
    let winMaxPeak = -Infinity;

    let relData;

    if (samplePerPx <= 1) {
      // check if view at start
      if (sS === 0) {
        relData = data.subarray(sS, eS + 2); // +2 to compensate for length
      } else {
        relData = data.subarray(sS - 1, eS + 2); // +2 to compensate for length
      }

      minSamples = Math.min.apply(Math, relData);
      maxSamples = Math.max.apply(Math, relData);
      samples = Array.prototype.slice.call(relData);

    } else {

      relData = data.subarray(sS, eS);
      // preallocate arraybuffer
      maxPeaks = new Float32Array(canvas.width);
      minPeaks = new Float32Array(canvas.width);

      for (let curPxIdx = 0; curPxIdx < canvas.width; curPxIdx++) {
        //for (var c = 0; c < numberOfChannels; c++) {
        // get window arround current pixel
        winStartSample = curPxIdx * samplePerPx - samplePerPx/2;
        winEndSample = curPxIdx * samplePerPx + samplePerPx/2;
        if(winStartSample < 0){ // at start of file the won't have the full length (other option would be left padding)
          winStartSample = 0;
        }
        let vals = relData.subarray(winStartSample, winEndSample);

        // var sum = 0;
        winMinPeak = Infinity;
        winMaxPeak = -Infinity;
        for (let p = 0; p < vals.length; p++) {
          if(vals[p] > winMaxPeak){
            winMaxPeak = vals[p];
          }

          if(vals[p] < winMinPeak){
            winMinPeak = vals[p];
          }

          // sum += vals[p];
        }
        // avrVal = sum / vals.length;
        //}

        maxPeaks[curPxIdx] = winMaxPeak;
        minPeaks[curPxIdx] = winMinPeak;
        if (winMaxPeak > maxMaxPeak) {
          maxMaxPeak = winMaxPeak;
        }
        if (winMinPeak < minMinPeak) {
          minMinPeak = winMinPeak;
        }
      }
    } //else

    return {
      'samples': samples,
      'minSample': minSamples,
      'maxSample': maxSamples,
      'minPeaks': minPeaks,
      'maxPeaks': maxPeaks,
      'minMinPeak': minMinPeak,
      'maxMaxPeak': maxMaxPeak,
      'samplePerPx': samplePerPx
    };
  };


  public static findMinMaxPeaks(sS, eS, winIdx, audioBuffer: AudioBuffer, osciPeaks) {

    const ssT = calculateSampleTime(sS, audioBuffer.sampleRate);
    const esT = calculateSampleTime(eS, audioBuffer.sampleRate);

    // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
    let pps = osciPeaks.sampleRate / osciPeaks.winSizes[winIdx];

    let startPeakWinIdx = ssT * pps;
    let endPeakWinIdx = esT * pps;

    let minMinPeak = Infinity;
    let maxMaxPeak = -Infinity;

    for(let i = Math.round(startPeakWinIdx); i < Math.round(endPeakWinIdx); i++){
      if (osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i] > maxMaxPeak) {
        maxMaxPeak = osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i];
      }
      if (osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i] < minMinPeak) {
        minMinPeak = osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i];
      }
    }

    return {
      // 'minPeaks': sServObj.osciPeaks.channelOsciPeaks[0].minPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
      // 'maxPeaks': sServObj.osciPeaks.channelOsciPeaks[0].maxPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
      'minMinPeak': minMinPeak,
      'maxMaxPeak': maxMaxPeak
    };

  }

  /**
   *
   */
  public static freshRedrawDrawOsciOnCanvas(ctx: CanvasRenderingContext2D,
                                            sS: number,
                                            eS: number,
                                            osciPeaks,
                                            audioBuffer: AudioBuffer,
                                            currentChannel: number) {
    const canvas = ctx.canvas;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // samples per pixel + one to correct for subtraction
    let samplesPerPx = (eS + 1 - sS) / canvas.width;

    let i;

    // find current peaks array window size by checking if
    let winIdx = -1;
    for (i = 0; i < osciPeaks.winSizes.length; i++) {
      if(samplesPerPx > osciPeaks.winSizes[i]){
        winIdx = i;
      }
    }

    let allPeakVals;

    let yMax, yMin;
    let yMaxPrev, yMinPrev;

    if(winIdx !== -1){
      // use pre calcuated peaks
      allPeakVals = DrawHelperService.findMinMaxPeaks(sS, eS, winIdx, audioBuffer, osciPeaks);

      let ssT = calculateSampleTime(sS, audioBuffer.sampleRate);

      // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
      let pps = osciPeaks.sampleRate / osciPeaks.winSizes[winIdx];

      let startPeakWinIdx = ssT * pps;

      ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;

      let peakIdx = Math.round(startPeakWinIdx);
      ctx.beginPath();
      yMax = ((allPeakVals.maxMaxPeak - osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
      yMin = ((allPeakVals.maxMaxPeak - osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
      ctx.moveTo(0, yMax);
      // ctx.lineTo(0, yMin);
      yMaxPrev = yMax;
      yMinPrev = yMin;

      let sT, curSample;
      for (let curPxIdx = 1; curPxIdx < canvas.width; curPxIdx++) {
        curSample = getSampleAtPixelPositionInViewport(curPxIdx, sS, eS, canvas.width);
        // calculate cur pixel sample time
        sT = calculateSampleTime(curSample, audioBuffer.sampleRate);
        peakIdx = Math.round(sT * pps);
        yMax = ((allPeakVals.maxMaxPeak - osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
        yMin = ((allPeakVals.maxMaxPeak - osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
        // draw connection to previous peaks (neccesary to avoid gaps in osci when maxMaxPeak === minMinPeak)
        ctx.moveTo(curPxIdx - 1, yMaxPrev);
        ctx.lineTo(curPxIdx - 1, yMax);
        ctx.moveTo(curPxIdx - 1, yMinPrev);
        ctx.lineTo(curPxIdx - 1, yMin);

        // connect current min and max peaks
        ctx.moveTo(curPxIdx, yMax);
        ctx.lineTo(curPxIdx, yMin);


        yMaxPrev = yMax;
        yMinPrev = yMin;

      }

      ctx.stroke();

    }else{
      // if winIdx is -1 then calculate the peaks from the channel data
      allPeakVals = DrawHelperService.calculatePeaks(canvas, audioBuffer.getChannelData(currentChannel), sS, eS);

      // check if envelope is to be drawn
      if (allPeakVals.minPeaks && allPeakVals.maxPeaks && allPeakVals.samplePerPx >= 1) {
        // draw envelope
        ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;

        ctx.beginPath();
        yMax = ((allPeakVals.maxMaxPeak - allPeakVals.maxPeaks[0]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
        yMin = ((allPeakVals.maxMaxPeak - allPeakVals.minPeaks[0]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
        ctx.moveTo(0, yMax);
        ctx.lineTo(0, yMin);

        yMaxPrev = yMax;
        yMinPrev = yMin;

        for(let i = 1; i < canvas.width; i++){
          yMax = ((allPeakVals.maxMaxPeak - allPeakVals.maxPeaks[i]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
          yMin = ((allPeakVals.maxMaxPeak - allPeakVals.minPeaks[i]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
          // draw connection to previous peaks (neccesary to avoid gaps in osci when maxMaxPeak === minMinPeak)
          ctx.moveTo(i - 1, yMaxPrev);
          ctx.lineTo(i - 1, yMax);
          ctx.moveTo(i - 1, yMinPrev);
          ctx.lineTo(i - 1, yMin);

          // connect current min and max peaks
          ctx.moveTo(i, yMax);
          ctx.lineTo(i, yMin);

          yMaxPrev = yMax;
          yMinPrev = yMin;

        }
        ctx.stroke();

        // otherwise draw samples
      } else if (allPeakVals.samplePerPx < 1) {
        // console.log("at 0 over sample exact")
        let hDbS = (1 / allPeakVals.samplePerPx) / 2; // half distance between samples
        let sNr = sS;
        // over sample exact
        ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;
        ctx.fillStyle = 'black';//ConfigProviderService.design.color.black;
        // ctx.beginPath();
        if (sS === 0) {
          ctx.moveTo(hDbS, (allPeakVals.samples[0] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
          for (i = 0; i < allPeakVals.samples.length; i++) {
            ctx.lineTo(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
          }
          ctx.stroke();
          // draw sample dots
          for (i = 0; i < allPeakVals.samples.length; i++) {
            ctx.beginPath();
            ctx.arc(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 3, 4, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fill();
            // if (ConfigProviderService.vals.restrictions.drawSampleNrs) {
            if(true){
              ctx.strokeText(sNr.toString(), i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
              sNr = sNr + 1;
            }
          }
        } else {
          //draw lines
          ctx.beginPath();
          ctx.moveTo(-hDbS, canvas.height - ((allPeakVals.samples[0] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height));
          for (i = 1; i <= allPeakVals.samples.length; i++) {
            ctx.lineTo(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height + 3));
          }
          ctx.stroke();
          // draw sample dots
          for (i = 1; i <= allPeakVals.samples.length; i++) {
            ctx.beginPath();
            ctx.arc(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height) - 3, 4, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fill();
            // if (ConfigProviderService.vals.restrictions.drawSampleNrs) {
            if(true){
              ctx.fillText(sNr.toString(), i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
              sNr = sNr + 1;
            }
          }

        }
      }
    }

    // if (ConfigProviderService.vals.restrictions.drawZeroLine) {
    if (true) {
      // draw zero line
      ctx.strokeStyle = '#4fc3f7';//ConfigProviderService.design.color.blue;
      ctx.fillStyle = '#4fc3f7'; //ConfigProviderService.design.color.blue;

      let zeroLineY;

      if (samplesPerPx >= 1) {
        zeroLineY = canvas.height - ((0 - allPeakVals.minMinPeak) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak) * canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, zeroLineY);
        ctx.lineTo(canvas.width, zeroLineY);
        ctx.stroke();
        ctx.fillText('0', 5, zeroLineY - 5, canvas.width);
      } else {
        zeroLineY = canvas.height - ((0 - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, zeroLineY);
        ctx.lineTo(canvas.width, zeroLineY);
        ctx.stroke();
        ctx.fill();
        ctx.fillText('0', 5, canvas.height - ((0 - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height) - 5, canvas.width);
      }
    }
  }


  /**
   * drawing method to drawMovingBoundaryLine
   */

  public static drawMovingBoundaryLine(ctx: CanvasRenderingContext2D,
                                viewportStartSample: number,
                                viewportEndSample: number,
                                position: number,
                                currentMouseItemIsLast: boolean,
                                currentMouseOverLevel: ILevel) {

    let xOffset, sDist;
    sDist = getPixelDistanceBetweenSamples(viewportStartSample, viewportEndSample, ctx.canvas.width);

    // calc. offset dependant on type of level of mousemove  -> default is sample exact
    if (currentMouseOverLevel.type === 'SEGMENT') {
      xOffset = 0;
    } else {
      xOffset = (sDist / 2);
    }

    ctx.fillStyle = 'blue'; //ConfigProviderService.design.color.blue;
    const p = Math.round(getPixelPositionOfSampleInViewport(
        position,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    ));
    if (currentMouseItemIsLast) {
      ctx.fillRect(p + sDist, 0, 1, ctx.canvas.height);
    } else {
      ctx.fillRect(p + xOffset, 0, 1, ctx.canvas.height);
    }

  }


  /**
   * drawing method to drawCurViewPortSelected
   */

  public static drawCurViewPortSelected(ctx: CanvasRenderingContext2D,
                                        drawTimeAndSamples: boolean,
                                        viewportStartSample: number,
                                        viewportEndSample: number,
                                        selectionStartSample: number,
                                        selectionEndSample: number,
                                        audioBuffer: AudioBuffer,
                                        currentMouseOverLevel: ILevel,
                                        primaryLineColor: string,
                                        fillColor: string) {

    let fontSize = 12;//this.config_provider_service.design.font.small.size.slice(0, -2) * 1;
    let xOffset, sDist, space, scaleX;
    sDist = getPixelDistanceBetweenSamples(viewportStartSample, viewportEndSample, ctx.canvas.width);

    // calc. offset dependant on type of level of mousemove  -> default is sample exact
    if (currentMouseOverLevel && currentMouseOverLevel.type === 'SEGMENT') {
      xOffset = 0;
    } else {
      xOffset = (sDist / 2);
    }

    const posS = getPixelPositionOfSampleInViewport(
        selectionStartSample,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    );
    const posE = getPixelPositionOfSampleInViewport(
        selectionEndSample,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    );

    if (posS === posE) {

      ctx.fillStyle = primaryLineColor;
      ctx.fillRect(posS + xOffset, 0, 2, ctx.canvas.height);

      if (drawTimeAndSamples) {
        if (viewportStartSample !== selectionStartSample && selectionStartSample !== -1) {
          scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
          space = DrawHelperService.getScaleWidth(ctx, selectionStartSample, MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / audioBuffer.sampleRate, 6), scaleX);
          // FontScaleService.drawUndistortedTextTwoLines(ctx, selectionStartSample, MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posE + 5, 0, ConfigProviderService.design.color.black, true);
        }
      }
    } else {
      ctx.fillStyle = fillColor;
      ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
      ctx.strokeStyle = primaryLineColor;
      ctx.beginPath();
      ctx.moveTo(posS, 0);
      ctx.lineTo(posS, ctx.canvas.height);
      ctx.moveTo(posE, 0);
      ctx.lineTo(posE, ctx.canvas.height);
      ctx.closePath();
      ctx.stroke();

      if (drawTimeAndSamples) {
        // start values
        scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
        space = DrawHelperService.getScaleWidth(ctx, selectionStartSample, MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / audioBuffer.sampleRate, 6), scaleX);
        // FontScaleService.drawUndistortedTextTwoLines(ctx, selectionStartSample, MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posS - space - 5, 0, ConfigProviderService.design.color.black, false);

        // end values
        // FontScaleService.drawUndistortedTextTwoLines(ctx, viewState.curViewPort.selectE, MathHelperService.roundToNdigitsAfterDecPoint(viewState.curViewPort.selectE / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posE + 5, 0, ConfigProviderService.design.color.black, true);
        // dur values
        // check if space
        space = DrawHelperService.getScale(ctx, MathHelperService.roundToNdigitsAfterDecPoint((selectionEndSample - selectionStartSample) / audioBuffer.sampleRate, 6), scaleX);

        if (posE - posS > space) {
          let str1 = selectionEndSample - selectionStartSample - 1;
          let str2 = MathHelperService.roundToNdigitsAfterDecPoint(((selectionEndSample - selectionStartSample) / audioBuffer.sampleRate), 6);
          space = DrawHelperService.getScaleWidth(ctx, str1, str2, scaleX);
          // FontScaleService.drawUndistortedTextTwoLines(ctx, str1, str2, fontSize, ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - space / 2, 0, ConfigProviderService.design.color.black, false);
        }
      }

    }

  };


  /**
   * only draw x (= vertical) line of crosshair
   * this is used to draw a red line at the current mouse position
   * on canvases where the mouse is currently not hovering over
   */
  public static drawCrossHairX(ctx, mouseX){
    ctx.strokeStyle = 'red'; //ConfigProviderService.design.color.transparent.red;
    ctx.fillStyle = 'red'; //ConfigProviderService.design.color.transparent.red;
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, ctx.canvas.height);
    ctx.stroke();
  }


  // /**
  //  * drawing method to drawCrossHairs
  //  */
  //
  // sServObj.drawCrossHairs = function (ctx, mouseEvt, min, max, unit, trackname) {
  //   // console.log(MathHelperService.roundToNdigitsAfterDecPoint(min, round))
  //   if (ConfigProviderService.vals.restrictions.drawCrossHairs) {
  //
  //     var fontSize = ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
  //     // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //     ctx.strokeStyle = ConfigProviderService.design.color.transparent.red;
  //     ctx.fillStyle = ConfigProviderService.design.color.transparent.red;
  //
  //     // see if Chrome -> dashed line
  //     //if (navigator.vendor === 'Google Inc.') {
  //     //	ctx.setLineDash([2]);
  //     //}
  //
  //     // draw lines
  //     var mouseX = viewState.getX(mouseEvt);
  //     var mouseY = viewState.getY(mouseEvt);
  //
  //     //if (navigator.vendor === 'Google Inc.') {
  //     //	ctx.setLineDash([0]);
  //     //}
  //
  //     // draw frequency / sample / time
  //     ctx.font = (ConfigProviderService.design.font.small.size + 'px ' + ConfigProviderService.design.font.small.family);
  //     var mouseFreq = MathHelperService.roundToNdigitsAfterDecPoint(max - mouseY / ctx.canvas.height * max, 2); // SIC only uses max
  //     @todo if this block is uncommented, FontScaleService.scaleX and .scaleY must be replaced with .getScaleX(ctx) and .getScaleY(ctx).
  //     var tW = ctx.measureText(mouseFreq + unit).width * fontScaleService.scaleX;
  //     var tH = fontSize * fontScaleService.scaleY;
  //     var s1 = Math.round(viewState.curViewPort.sS + mouseX / ctx.canvas.width * (viewState.curViewPort.eS - viewState.curViewPort.sS));
  //     var s2 = MathHelperService.roundToNdigitsAfterDecPoint(viewState.getViewPortStartTime() + mouseX / ctx.canvas.width * (viewState.getViewPortEndTime() - viewState.getViewPortStartTime()), 6);
  //
  //     var y;
  //     if(mouseY + tH < ctx.canvas.height){
  //       y = mouseY + 5;
  //     }else{
  //       y = mouseY - tH - 5;
  //     }
  //
  //     if (max !== undefined || min !== undefined) {
  //       if (trackname === 'OSCI') {
  //         // no horizontal values
  //         ctx.beginPath();
  //         //ctx.moveTo(0, mouseY);
  //         //ctx.lineTo(5, mouseY + 5);
  //         //ctx.moveTo(0, mouseY);
  //         //ctx.lineTo(ctx.canvas.width, mouseY);
  //         //ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
  //         ctx.moveTo(mouseX, 0);
  //         ctx.lineTo(mouseX, ctx.canvas.height);
  //         ctx.stroke();
  //       } else if (trackname === 'SPEC') {
  //         FontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, ConfigProviderService.design.font.small.family, 5, y, ConfigProviderService.design.color.transparent.red, true);
  //         FontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, ConfigProviderService.design.font.small.family, ctx.canvas.width - tW, y, ConfigProviderService.design.color.transparent.red, true);
  //
  //         ctx.beginPath();
  //         ctx.moveTo(0, mouseY);
  //         ctx.lineTo(5, mouseY + 5);
  //         ctx.moveTo(0, mouseY);
  //         ctx.lineTo(ctx.canvas.width, mouseY);
  //         ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
  //         ctx.moveTo(mouseX, 0);
  //         ctx.lineTo(mouseX, ctx.canvas.height);
  //         ctx.stroke();
  //       } else {
  //         // draw min max an name of track
  //         var tr = ConfigProviderService.getSsffTrackConfig(trackname);
  //         var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
  //         mouseFreq = col._maxVal - (mouseY / ctx.canvas.height * (col._maxVal - col._minVal));
  //         mouseFreq = MathHelperService.roundToNdigitsAfterDecPoint(mouseFreq, 2); // crop
  //         FontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, ConfigProviderService.design.font.small.family, 5, y, ConfigProviderService.design.color.transparent.red, true);
  //         FontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, ConfigProviderService.design.font.small.family, ctx.canvas.width - 5 - tW, y, ConfigProviderService.design.color.transparent.red, true);
  //         ctx.beginPath();
  //         ctx.moveTo(0, mouseY);
  //         ctx.lineTo(5, mouseY + 5);
  //         ctx.moveTo(0, mouseY);
  //         ctx.lineTo(ctx.canvas.width, mouseY);
  //         ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
  //         ctx.moveTo(mouseX, 0);
  //         ctx.lineTo(mouseX, ctx.canvas.height);
  //         ctx.stroke();
  //       }
  //     }
  //     FontScaleService.drawUndistortedTextTwoLines(ctx, s1, s2, fontSize, ConfigProviderService.design.font.small.family, mouseX + 5, 0, ConfigProviderService.design.color.transparent.red, true);
  //   }
  // };

  /**
   * drawing method to drawMinMaxAndName
   * @param ctx is context to be drawn on
   * @param trackName name of track to be drawn in the center of the canvas (left aligned)
   * @param min value to be drawn at the bottom of the canvas (left aligned)
   * @param max value to be drawn at the top of the canvas (left aligned)
   * @param round value to round to for min/max values (== digits after comma)
   */

  public static drawMinMaxAndName(ctx, trackName, min, max, round) {
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;
    ctx.fillStyle = 'black';// ConfigProviderService.design.color.black;

    let fontSize = 12;//ConfigProviderService.design.font.small.size.slice(0, -2) * 1;

    // // var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
    let scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

    let smallFontSize = 12 * 3 / 4; //ConfigProviderService.design.font.small.size.slice(0, -2) * 3 / 4;
    var th = smallFontSize * scaleY;

    // draw corner pointers
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 5);
    ctx.moveTo(0, ctx.canvas.height);
    ctx.lineTo(5, ctx.canvas.height - 5);
    ctx.stroke();
    ctx.closePath();

    // draw trackName
    if (trackName !== '') {
      FontScaleService.drawUndistortedText(ctx, trackName, fontSize, '', 0, ctx.canvas.height / 2, 'HelveticaNeue', 'left', 'baseline');
    }

    // draw min/max vals
    if (max !== undefined) {
      FontScaleService.drawUndistortedText(ctx, 'max: ' + MathHelperService.roundToNdigitsAfterDecPoint(max, round), smallFontSize, 'HelveticaNeue', 5, 0, 'grey', 'left', 'top');
    }
    // draw min/max vals
    if (min !== undefined) {
      FontScaleService.drawUndistortedText(ctx, 'min: ' + MathHelperService.roundToNdigitsAfterDecPoint(min, round), smallFontSize, 'HelveticaNeue', 5, ctx.canvas.height, 'grey', 'left', 'bottom');
    }
  }

  /**
   *
   */
  public static drawViewPortTimes(ctx: CanvasRenderingContext2D,
                    viewportStartSample: number,
                    viewportEndSample: number,
                    sampleRate: number) {
    ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;
    ctx.fillStyle = 'black';//ConfigProviderService.design.color.black;
    ctx.font = 'HelveticaNeue';//(ConfigProviderService.design.font.small.size + ' ' + ConfigProviderService.design.font.small.family);

    let fontSize = 12;//ConfigProviderService.design.font.small.size.slice(0, -2) * 1;

    // lines to corners
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 5);
    ctx.moveTo(ctx.canvas.width, 0);
    ctx.lineTo(ctx.canvas.width - 5, 5);
    ctx.closePath();
    ctx.stroke();
    let sTime;
    let eTime;
    //draw time and sample nr
    sTime = MathHelperService.roundToNdigitsAfterDecPoint(viewportStartSample / sampleRate, 6);
    eTime = MathHelperService.roundToNdigitsAfterDecPoint(viewportEndSample / sampleRate, 6);
    FontScaleService.drawUndistortedTextTwoLines(ctx, viewportStartSample.toString(), sTime, fontSize, 'HelveticaNeue', 5, 2 * fontSize, 'black', 'left');
    FontScaleService.drawUndistortedTextTwoLines(ctx, viewportEndSample.toString(), eTime, fontSize, 'HelveticaNeue', ctx.canvas.width - 5, 2 * fontSize, 'black', 'right');
  };

}
