import { Injectable } from '@angular/core';

import { ViewStateService } from './view-state.service';
import { SoundHandlerService } from './sound-handler.service';
import { ConfigProviderService } from './config-provider.service';
import { MathHelperService } from './math-helper.service';
import { FontScaleService } from './font-scale.service';

@Injectable({
  providedIn: 'root'
})
export class DrawHelperService {

  constructor(private view_state_service: ViewStateService,
              private sound_handler_service: SoundHandlerService,
              private config_provider_service: ConfigProviderService,
              private math_helper_service: MathHelperService) { }

  osciPeaks: any = {};

  private getScale(ctx, str, scale) {
    return ctx.measureText(str).width * scale;
  }

  private getScaleWidth(ctx, str1, str2, scaleX) {
    if (str1 !== undefined && str1.toString().length > str2.toString().length) {
      return this.getScale(ctx, str1, scaleX);
    } else {
      return this.getScale(ctx, str2, scaleX);
    }
  }

  /**
   *
   */
  public calculateOsciPeaks() {
    let sampleRate = this.sound_handler_service.audioBuffer.sampleRate;
    let numberOfChannels = this.sound_handler_service.audioBuffer.numberOfChannels;

    // TODO mix all channels

    // calculate 3 peak levels (inspired by http://www.reaper.fm/sdk/reapeaks.txt files)
    //   1. At approximately 400 peaks/sec (divfactor 110 at 44khz)
    let winSize0 = sampleRate / 400;
    //   2. At approximately 10 peaks/sec (divfactor 4410 at 44khz)
    let winSize1 = sampleRate / 10;
    //   3. At approximately 1 peaks/sec (divfactor 44100 at 44khz)
    let winSize2 = sampleRate / 1;

    // set initial result values
    this.osciPeaks = {
      'numberOfChannels': numberOfChannels,
      'sampleRate': sampleRate,
      'winSizes': [winSize0, winSize1, winSize2],
      'channelOsciPeaks': []
    };


    //////////////////////////
    // go through channels

    for(let channelIdx = 0; channelIdx < numberOfChannels; channelIdx++){

      let curChannelSamples = this.sound_handler_service.audioBuffer.getChannelData(channelIdx);

      // preallocate min max peaks arrays
      let curChannelMaxPeaksWinSize0 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize0));
      let curChannelMinPeaksWinSize0 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize0));

      let curChannelMaxPeaksWinSize1 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize1));
      let curChannelMinPeaksWinSize1 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize1));

      let curChannelMaxPeaksWinSize2 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize2));
      let curChannelMinPeaksWinSize2 = new Float32Array(Math.round(this.sound_handler_service.audioBuffer.length / winSize2));

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

      this.osciPeaks.channelOsciPeaks[channelIdx] = {
        'maxPeaks': [curChannelMaxPeaksWinSize0, curChannelMaxPeaksWinSize1, curChannelMaxPeaksWinSize2],
        'minPeaks': [curChannelMinPeaksWinSize0, curChannelMinPeaksWinSize1, curChannelMinPeaksWinSize2]
      };

    }
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
  public calculatePeaks = function (canvas, data, sS, eS) {

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


  public findMinMaxPeaks(sS, eS, winIdx){

    let ssT = this.view_state_service.calcSampleTime(sS);
    let esT = this.view_state_service.calcSampleTime(eS);

    // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
    let pps = this.osciPeaks.sampleRate / this.osciPeaks.winSizes[winIdx];

    let startPeakWinIdx = ssT * pps;
    let endPeakWinIdx = esT * pps;

    let minMinPeak = Infinity;
    let maxMaxPeak = -Infinity;

    for(let i = Math.round(startPeakWinIdx); i < Math.round(endPeakWinIdx); i++){
      if (this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i] > maxMaxPeak) {
        maxMaxPeak = this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i];
      }
      if (this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i] < minMinPeak) {
        minMinPeak = this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i];
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
  public freshRedrawDrawOsciOnCanvas(canvas, sS, eS, forceToCalcOsciPeaks) {
    // clear canvas
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(forceToCalcOsciPeaks){
      this.osciPeaks = {};
    }

    // calc osciPeaks if these have not been calculated yet
    // if(Object.keys(this.osciPeaks).length === 0 && this.osciPeaks.constructor === Object){
    if(true){
      this.calculateOsciPeaks();
    }

    // samples per pixel + one to correct for subtraction
    let samplesPerPx = (eS + 1 - sS) / canvas.width;

    let i;

    // find current peaks array window size by checking if
    let winIdx = -1;
    for (i = 0; i < this.osciPeaks.winSizes.length; i++) {
      if(samplesPerPx > this.osciPeaks.winSizes[i]){
        winIdx = i;
      }
    }

    let allPeakVals;

    let yMax, yMin;
    let yMaxPrev, yMinPrev;

    if(winIdx !== -1){
      // use pre calcuated peaks
      allPeakVals = this.findMinMaxPeaks(sS, eS, winIdx);

      let ssT = this.view_state_service.calcSampleTime(sS);

      // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
      let pps = this.osciPeaks.sampleRate / this.osciPeaks.winSizes[winIdx];

      let startPeakWinIdx = ssT * pps;

      ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;

      let peakIdx = Math.round(startPeakWinIdx);
      ctx.beginPath();
      yMax = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
      yMin = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
      ctx.moveTo(0, yMax);
      // ctx.lineTo(0, yMin);
      yMaxPrev = yMax;
      yMinPrev = yMin;

      let sT, perc, curSample;
      for (let curPxIdx = 1; curPxIdx < canvas.width; curPxIdx++) {
        perc = curPxIdx / canvas.width;
        curSample = this.view_state_service.getCurrentSample(perc);
        // calculate cur pixel sample time
        sT = this.view_state_service.calcSampleTime(curSample);
        peakIdx = Math.round(sT * pps);
        yMax = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
        yMin = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
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
      allPeakVals = this.calculatePeaks(canvas, this.sound_handler_service.audioBuffer.getChannelData(this.view_state_service.osciSettings.curChannel), sS, eS);

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
        let sNr = this.view_state_service.curViewPort.sS;
        // over sample exact
        ctx.strokeStyle = 'black';//ConfigProviderService.design.color.black;
        ctx.fillStyle = 'black';//ConfigProviderService.design.color.black;
        // ctx.beginPath();
        if (this.view_state_service.curViewPort.sS === 0) {
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
              ctx.strokeText(sNr, i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
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
              ctx.fillText(sNr, i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
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

  public drawMovingBoundaryLine(ctx) {

    let xOffset, sDist;
    sDist = this.view_state_service.getSampleDist(ctx.canvas.width);

    // calc. offset dependant on type of level of mousemove  -> default is sample exact
    if (this.view_state_service.getcurMouseLevelType() === 'SEGMENT') {
      xOffset = 0;
    } else {
      xOffset = (sDist / 2);
    }

    if (this.view_state_service.movingBoundary) {
      ctx.fillStyle = 'blue'; //ConfigProviderService.design.color.blue;
      let p = Math.round(this.view_state_service.getPos(ctx.canvas.width, this.view_state_service.movingBoundarySample));
      if (this.view_state_service.getcurMouseisLast()) {
        ctx.fillRect(p + sDist, 0, 1, ctx.canvas.height);
      } else {
        ctx.fillRect(p + xOffset, 0, 1, ctx.canvas.height);
      }
    }

  }


  /**
   * drawing method to drawCurViewPortSelected
   */

  public drawCurViewPortSelected(ctx, drawTimeAndSamples) {

    let fontSize = 12;//this.config_provider_service.design.font.small.size.slice(0, -2) * 1;
    let xOffset, sDist, space, scaleX;
    sDist = this.view_state_service.getSampleDist(ctx.canvas.width);

    // calc. offset dependant on type of level of mousemove  -> default is sample exact
    if (this.view_state_service.getcurMouseLevelType() === 'seg') {
      xOffset = 0;
    } else {
      xOffset = (sDist / 2);
    }

    let posS = this.view_state_service.getPos(ctx.canvas.width, this.view_state_service.curViewPort.selectS);
    let posE = this.view_state_service.getPos(ctx.canvas.width, this.view_state_service.curViewPort.selectE);

    if (posS === posE) {

      ctx.fillStyle = 'black';//ConfigProviderService.design.color.transparent.black;
      ctx.fillRect(posS + xOffset, 0, 2, ctx.canvas.height);

      if (drawTimeAndSamples) {
        if (this.view_state_service.curViewPort.sS !== this.view_state_service.curViewPort.selectS && this.view_state_service.curViewPort.selectS !== -1) {
          scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
          space = this.getScaleWidth(ctx, this.view_state_service.curViewPort.selectS, this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.selectS / this.sound_handler_service.audioBuffer.sampleRate, 6), scaleX);
          // fontScaleService.drawUndistortedTextTwoLines(ctx, this.view_state_service.curViewPort.selectS, this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.selectS / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posE + 5, 0, ConfigProviderService.design.color.black, true);
        }
      }
    } else {
      ctx.fillStyle = 'grey';//ConfigProviderService.design.color.transparent.grey;
      ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
      ctx.strokeStyle = 'black'; //ConfigProviderService.design.color.transparent.black;
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
        space = this.getScaleWidth(ctx, this.view_state_service.curViewPort.selectS, this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.selectS / this.sound_handler_service.audioBuffer.sampleRate, 6), scaleX);
        // fontScaleService.drawUndistortedTextTwoLines(ctx, viewState.curViewPort.selectS, this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.selectS / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posS - space - 5, 0, ConfigProviderService.design.color.black, false);

        // end values
        // fontScaleService.drawUndistortedTextTwoLines(ctx, viewState.curViewPort.selectE, this.math_helper_service.roundToNdigitsAfterDecPoint(viewState.curViewPort.selectE / Soundhandlerservice.audioBuffer.sampleRate, 6), fontSize, ConfigProviderService.design.font.small.family, posE + 5, 0, ConfigProviderService.design.color.black, true);
        // dur values
        // check if space
        space = this.getScale(ctx, this.math_helper_service.roundToNdigitsAfterDecPoint((this.view_state_service.curViewPort.selectE - this.view_state_service.curViewPort.selectS) / this.sound_handler_service.audioBuffer.sampleRate, 6), scaleX);

        if (posE - posS > space) {
          let str1 = this.view_state_service.curViewPort.selectE - this.view_state_service.curViewPort.selectS - 1;
          let str2 = this.math_helper_service.roundToNdigitsAfterDecPoint(((this.view_state_service.curViewPort.selectE - this.view_state_service.curViewPort.selectS) / this.sound_handler_service.audioBuffer.sampleRate), 6);
          space = this.getScaleWidth(ctx, str1, str2, scaleX);
          // fontScaleService.drawUndistortedTextTwoLines(ctx, str1, str2, fontSize, ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - space / 2, 0, ConfigProviderService.design.color.black, false);
        }
      }

    }

  };


  /**
   * only draw x (= vertical) line of crosshair
   * this is used to draw a red line at the current mouse position
   * on canvases where the mouse is currently not hovering over
   */
  public drawCrossHairX(ctx, mouseX){
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
  //   // console.log(this.math_helper_service.roundToNdigitsAfterDecPoint(min, round))
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
  //     var mouseFreq = this.math_helper_service.roundToNdigitsAfterDecPoint(max - mouseY / ctx.canvas.height * max, 2); // SIC only uses max
  //     @todo if this block is uncommented, FontScaleService.scaleX and .scaleY must be replaced with .getScaleX(ctx) and .getScaleY(ctx).
  //     var tW = ctx.measureText(mouseFreq + unit).width * fontScaleService.scaleX;
  //     var tH = fontSize * fontScaleService.scaleY;
  //     var s1 = Math.round(viewState.curViewPort.sS + mouseX / ctx.canvas.width * (viewState.curViewPort.eS - viewState.curViewPort.sS));
  //     var s2 = this.math_helper_service.roundToNdigitsAfterDecPoint(viewState.getViewPortStartTime() + mouseX / ctx.canvas.width * (viewState.getViewPortEndTime() - viewState.getViewPortStartTime()), 6);
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
  //         fontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, ConfigProviderService.design.font.small.family, 5, y, ConfigProviderService.design.color.transparent.red, true);
  //         fontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, ConfigProviderService.design.font.small.family, ctx.canvas.width - tW, y, ConfigProviderService.design.color.transparent.red, true);
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
  //         mouseFreq = this.math_helper_service.roundToNdigitsAfterDecPoint(mouseFreq, 2); // crop
  //         fontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, ConfigProviderService.design.font.small.family, 5, y, ConfigProviderService.design.color.transparent.red, true);
  //         fontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, ConfigProviderService.design.font.small.family, ctx.canvas.width - 5 - tW, y, ConfigProviderService.design.color.transparent.red, true);
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
  //     fontScaleService.drawUndistortedTextTwoLines(ctx, s1, s2, fontSize, ConfigProviderService.design.font.small.family, mouseX + 5, 0, ConfigProviderService.design.color.transparent.red, true);
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

  drawMinMaxAndName(ctx, trackName, min, max, round) {
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
      FontScaleService.drawUndistortedText(ctx, trackName, fontSize, '', 0, ctx.canvas.height / 2 - fontSize * scaleY / 2, 'HelveticaNeue', true);
    }

    // draw min/max vals
    if (max !== undefined) {
      FontScaleService.drawUndistortedText(ctx, 'max: ' + this.math_helper_service.roundToNdigitsAfterDecPoint(max, round), smallFontSize, 'HelveticaNeue', 5, 5, 'grey', true);
    }
    // draw min/max vals
    if (min !== undefined) {
      FontScaleService.drawUndistortedText(ctx, 'min: ' + this.math_helper_service.roundToNdigitsAfterDecPoint(min, round), smallFontSize, 'HelveticaNeue', 5, ctx.canvas.height - th - 5, 'grey', true);
    }
  }

  /**
   *
   */
  drawViewPortTimes(ctx) {
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
    let scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
    let sTime;
    let eTime;
    let space;
    if (this.view_state_service.curViewPort) {
      //draw time and sample nr
      sTime = this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.sS / this.sound_handler_service.audioBuffer.sampleRate, 6);
      eTime = this.math_helper_service.roundToNdigitsAfterDecPoint(this.view_state_service.curViewPort.eS / this.sound_handler_service.audioBuffer.sampleRate, 6);
      FontScaleService.drawUndistortedTextTwoLines(ctx, this.view_state_service.curViewPort.sS, sTime, fontSize, 'HelveticaNeue', 5, 0, 'black', true);
      space = this.getScaleWidth(ctx, this.view_state_service.curViewPort.eS, eTime, scaleX);
      FontScaleService.drawUndistortedTextTwoLines(ctx, this.view_state_service.curViewPort.eS, eTime, fontSize, 'HelveticaNeue', ctx.canvas.width - space - 5, 0, 'black', false);
    }
  };

}
