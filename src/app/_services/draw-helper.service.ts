import { MathHelperService } from './math-helper.service';
import { FontScaleService } from './font-scale.service';
import {
    getSampleAtPixelPositionInViewport,
    getTimeOfSample
} from '../_utilities/view-state-helper-functions';
import {EmuWebappTheme} from '../_interfaces/emu-webapp-theme.interface';

export class DrawHelperService {

  private static getScale(ctx, str) {
    return ctx.measureText(str).width * FontScaleService.getScaleX(ctx);
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

    const ssT = getTimeOfSample(sS, audioBuffer.sampleRate).end;
    const esT = getTimeOfSample(eS, audioBuffer.sampleRate).end;

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
                                            currentChannel: number,
                                            emuWebappTheme: EmuWebappTheme) {
    const canvas = ctx.canvas;

    // clear canvas
    ctx.fillStyle = emuWebappTheme.canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      let ssT = getTimeOfSample(sS, audioBuffer.sampleRate).end;

      // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
      let pps = osciPeaks.sampleRate / osciPeaks.winSizes[winIdx];

      let startPeakWinIdx = ssT * pps;

      ctx.strokeStyle = emuWebappTheme.primaryLineColor;

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
        sT = getTimeOfSample(curSample, audioBuffer.sampleRate).end;
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
        ctx.strokeStyle = emuWebappTheme.primaryLineColor;

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
        ctx.strokeStyle = emuWebappTheme.primaryLineColor;
        ctx.fillStyle = emuWebappTheme.primaryLineColor;
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
            // if(false){
            //   ctx.fillText(sNr.toString(), i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
            //   sNr = sNr + 1;
            // }
          }

        }
      }
    }

    // if (ConfigProviderService.vals.restrictions.drawZeroLine) {
    if (true) {
      // draw zero line
      ctx.strokeStyle = emuWebappTheme.osciZeroLineColor;
      ctx.fillStyle = emuWebappTheme.osciZeroLineColor;

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
  //     NOTE viewState.getViewPortStartTime() is now getTimeOfSample(this._viewport_sample_start, this._audio_buffer.sampleRate).start;
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
      FontScaleService.drawUndistortedText(ctx, trackName, fontSize, '', 0, ctx.canvas.height / 2, 'HelveticaNeue', 'left', 'middle');
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
}
