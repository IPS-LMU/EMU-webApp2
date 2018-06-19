import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import { FontScaleService } from '../_services/font-scale.service';
import { SsffDataService } from '../_services/ssff-data.service';
import { ConfigProviderService } from '../_services/config-provider.service';
import { ViewStateService } from '../_services/view-state.service';

@Component({
  selector: 'app-ssff-track',
  templateUrl: './ssff-track.component.html',
  styleUrls: ['./ssff-track.component.scss']
})
export class SsffTrackComponent implements OnInit {

  private _name: string;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _main_context;
  private assTrackName: string;

  @Input() set name(value: any){
    this._name = value;
    console.log(value);
  }

  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;
    console.log("setting _viewport_sample_start");
    // this.redraw();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;
    console.log("setting _viewport_sample_end");
    if(this._viewport_sample_end !== 0){ // SIC this has to be done better!
      this.handleUpdate();
    }
  }

  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  // @ViewChild('markupCanvas') markupCanvas: ElementRef;

  constructor(private font_scale_service: FontScaleService,
              private ssff_data_service: SsffDataService,
              private config_provider_service: ConfigProviderService,
              private view_state_service: ViewStateService) { }

  ngOnInit() {
    this._main_context = this.mainCanvas.nativeElement.getContext('2d');
  }

  // // select the needed DOM elements from the template
  // var canvasLength = element.find('canvas').length;
  // var markupCanvas = element.find('canvas')[canvasLength - 1];
  // // var context = canvas0.getContext('2d');
  // var markupCtx = markupCanvas.getContext('2d');
  // var trackName;
  // scope.lmds = loadedMetaDataService;
  //
  // attrs.$observe('trackName', function (val) {
  //   if (val) {
  //     trackName = val;
  //   }
  // });
  // scope.order = attrs.order;
  //
  //
  // /////////////////////
  // // watches
  //
  // //
  // //
  // scope.$watch('vs.lastUpdate', function (newValue, oldValue) {
  //   if (newValue !== oldValue) {
  //     scope.drawSsffTrackMarkup();
  //   }
  // });
  //
  // //
  // scope.$watch('vs.timelineSize', function () {
  //   $timeout(scope.drawSsffTrackMarkup, ConfigProviderService.design.animation.duration);
  // });
  //
  // scope.$watch('vs.curViewPort', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       scope.drawSsffTrackMarkup();
  //     }
  //   }
  // }, true);
  //
  // scope.$watch('ssffds.data.length', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       scope.drawSsffTrackMarkup();
  //     }
  //   }
  // }, true);
  //
  // scope.$watch('vs.movingBoundary', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       scope.drawSsffTrackMarkup();
  //     }
  //   }
  // }, true);
  //
  //
  // scope.$watch('vs.movingBoundarySample', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       scope.drawSsffTrackMarkup();
  //     }
  //   }
  // }, true);
  //
  // scope.$watch('vs.curMouseX', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       // only draw corsshair x line if mouse currently not over canvas
  //       if(viewState.curMouseTrackName !== trackName) {
  //         scope.drawSsffTrackMarkup();
  //       }
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
  //         scope.drawSsffTrackMarkup();
  //       }
  //     }
  //   }
  // }, true);
  //
  // //
  // /////////////////////

  // /**
  //  *
  //  */
  // scope.drawSsffTrackMarkup = function () {
  //   if (!$.isEmptyObject(scope.ssffds.data)) {
  //     if (scope.ssffds.data.length !== 0) {
  //
  //       markupCtx.clearRect(0, 0, markupCtx.canvas.width, markupCtx.canvas.height);
  //
  //       // draw moving boundary line if moving
  //       scope.dhs.drawMovingBoundaryLine(markupCtx);
  //
  //       // draw current viewport selected
  //       scope.dhs.drawCurViewPortSelected(markupCtx, false);
  //
  //       // draw min max an name of track
  //       var tr = scope.cps.getSsffTrackConfig(trackName);
  //       var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
  //       var minMaxValLims = scope.cps.getValueLimsOfTrack(tr.name);
  //
  //       var minVal, maxVal;
  //       if(!angular.equals(minMaxValLims, {})){
  //         minVal = minMaxValLims.minVal;
  //         maxVal = minMaxValLims.maxVal;
  //       }else{
  //         minVal = col._minVal;
  //         maxVal = col._maxVal;
  //       }
  //
  //       scope.dhs.drawMinMaxAndName(markupCtx, trackName, minVal, maxVal, 2);
  //       Drawhelperservice.drawCrossHairX(markupCtx, viewState.curMouseX);
  //     }
  //   }
  // };

  /**
   *
   */
  handleUpdate() {
    // let ctx = element[0].getContext('2d');
    this._main_context.clearRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

    if (!(this.ssff_data_service.data && (Object.keys(this.ssff_data_service.data).length === 0))) {
      if (this.ssff_data_service.data.length !== 0) {
        this.assTrackName = '';
        // check assignments (= overlays)
        this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].signalCanvases.assign.forEach((ass) => {
          if (ass.signalCanvasName === this._name) {
            this.assTrackName = ass.ssffTrackName;
            let tr = this.config_provider_service.getSsffTrackConfig(ass.ssffTrackName);
            let col = this.ssff_data_service.getColumnOfTrack(tr.name, tr.columnName);
            let sRaSt = this.ssff_data_service.getSampleRateAndStartTimeOfTrack(tr.name);
            let minMaxCountourLims = this.config_provider_service.getContourLimsOfTrack(tr.name);
            let minMaxValLims = this.config_provider_service.getValueLimsOfTrack(tr.name);
            // draw values
            this.drawValues(this.view_state_service, this.mainCanvas.nativeElement, ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxCountourLims, minMaxValLims);
          }
        });
        this.assTrackName = '';
        // draw ssffTrack onto own canvas
        if (this._name !== 'OSCI' && this._name !== 'SPEC') {

          let tr = this.config_provider_service.getSsffTrackConfig(this._name);
          let col = this.ssff_data_service.getColumnOfTrack(tr.name, tr.columnName);
          let sRaSt = this.ssff_data_service.getSampleRateAndStartTimeOfTrack(tr.name);

          let minMaxContourLims = this.config_provider_service.getContourLimsOfTrack(tr.name);
          let minMaxValLims = this.config_provider_service.getValueLimsOfTrack(tr.name);
          //console.log(minMaxValLims);
          // draw values
          this.drawValues(this.view_state_service, this.mainCanvas.nativeElement, ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
        }
      }
    } else {
      this._main_context.clearRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    }
  }

  /**
   * draw values onto canvas
   */
  drawValues(viewState, canvas, config, col, sR, sT, minMaxContourLims, minMaxValLims) {

    let minVal, maxVal;

    if (this._name === 'SPEC' && this.assTrackName === 'FORMANTS') {
      minVal = viewState.spectroSettings.rangeFrom;
      maxVal = viewState.spectroSettings.rangeTo;
    } else {
      minVal = col._minVal;
      maxVal = col._maxVal;
    }
    // if minMaxValLims are set use those instead

    if(!minMaxValLims && (Object.keys(minMaxValLims).length === 0)){
      minVal = minMaxValLims.minVal;
      maxVal = minMaxValLims.maxVal;
    }

    let startTimeVP = this.view_state_service.getViewPortStartTime();
    let endTimeVP = this.view_state_service.getViewPortEndTime();
    let colStartSampleNr = Math.round(startTimeVP * sR + sT);
    let colEndSampleNr = Math.round(endTimeVP * sR + sT);
    let nrOfSamples = colEndSampleNr - colStartSampleNr;
    let curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

    if (nrOfSamples < canvas.width && nrOfSamples >= 2) {

      let x, y, curSampleInCol, curSampleInColTime;

      ////////////////////////////////
      // NEW VERSION
      ////////////////////////////////

      curSampleArrs[0].forEach((contourVal, contourNr) => {

        // console.log(contourNr);

        if ((minMaxContourLims && (Object.keys(minMaxContourLims).length === 0)) || (contourNr >= minMaxContourLims.minContourIdx && contourNr <= minMaxContourLims.maxContourIdx)) {

          // set color
          if (minMaxContourLims && (Object.keys(minMaxContourLims).length === 0)) {
            this._main_context.strokeStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
            this._main_context.fillStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
          } else {
            let l = (minMaxContourLims.maxContourIdx - minMaxContourLims.minContourIdx) + 1;
            this._main_context.strokeStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
            this._main_context.fillStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
          }

          // overwrite color settings if they are preconfigured
          let contColors = this.config_provider_service.getContourColorsOfTrack(this.assTrackName);
          if (contColors !== undefined) {
            if (contColors.colors[contourNr] !== undefined) {
              this._main_context.strokeStyle = this.config_provider_service.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
              this._main_context.fillStyle = this.config_provider_service.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
            }
          }

          // mark selected
          // console.log(viewState.curCorrectionToolNr);
          if (viewState.curCorrectionToolNr - 1 === contourNr && this._name === 'SPEC' && this.assTrackName === 'FORMANTS') {
            this._main_context.strokeStyle = 'green';//ConfigProviderService.design.color.green;
            this._main_context.fillStyle = 'green';//ConfigProviderService.design.color.green;
          }

          this._main_context.beginPath();
          // first line from sample not in view (left)
          if (colStartSampleNr >= 1) {
            let leftBorder = col.values[colStartSampleNr - 1];
            let leftVal = leftBorder[contourNr];

            curSampleInCol = colStartSampleNr - 1;
            curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            y = canvas.height - ((leftVal - minVal) / (maxVal - minVal) * canvas.height);

            this._main_context.moveTo(x, y);
          }

          curSampleArrs.forEach((curArr, curArrIdx) => {
            // console.log(curArr[contourNr]);

            curSampleInCol = colStartSampleNr + curArrIdx;
            curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            y = canvas.height - ((curArr[contourNr] - minVal) / (maxVal - minVal) * canvas.height);

            this._main_context.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
            this._main_context.lineTo(x, y);

          });
          // last line from sample not in view (right)
          if (colEndSampleNr < col.values.length - 1) {
            let rightBorder = col.values[colEndSampleNr + 1];
            let rightVal = rightBorder[contourNr];

            curSampleInCol = colEndSampleNr + 1;
            curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            y = canvas.height - ((rightVal - minVal) / (maxVal - minVal) * canvas.height);

            this._main_context.lineTo(x, y);
          }

          this._main_context.stroke();
          // ctx.fill();
        }
      });
    } else {
      this._main_context.strokeStyle = 'red';
      if (nrOfSamples <= 2) {
        this.font_scale_service.drawUndistortedTextTwoLines(this._main_context, 'Zoom out to', 'see contour(s)', 12 / 1.05, 'HelveticaNeue', canvas.width / 2 - (this._main_context.measureText('see contour(s)').width * this._main_context.canvas.width / this._main_context.canvas.offsetWidth / 2), 25, 'red', false);
      } else {
        this.font_scale_service.drawUndistortedTextTwoLines(this._main_context, 'Zoom in to', 'see contour(s)', 12 / 1.05, 'HelveticaNeue', canvas.width / 2 - (this._main_context.measureText('see contour(s)').width * this._main_context.canvas.width / this._main_context.canvas.offsetWidth / 2), 25, 'red', false);
      }
    }
  }

}