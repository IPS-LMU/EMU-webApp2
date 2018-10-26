import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import { FontScaleService } from '../_services/font-scale.service';
import { SsffDataService } from '../_services/ssff-data.service';
import { ConfigProviderService } from '../_services/config-provider.service';
import { ViewStateService } from '../_services/view-state.service';
import {getMousePositionInCanvasX, getSampleNumberAtCanvasMouseEvent, getTimeOfSample} from '../_utilities/view-state-helper-functions';
import {adjustSelection} from '../_utilities/adjust-selection.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {drawMovingBoundaryLines} from '../_utilities/drawing/markup-elements/draw-moving-boundary-lines.function';
import {drawSelection} from '../_utilities/drawing/markup-elements/draw-selection.function';
import {drawVerticalCrossHair} from '../_utilities/drawing/markup-elements/draw-vertical-cross-hair.function';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {drawMinMaxAndName} from '../_utilities/drawing/markup-elements/draw-min-max-and-name.function';

@Component({
  selector: 'app-ssff-track',
  templateUrl: './ssff-track.component.html',
  styleUrls: ['./ssff-track.component.scss']
})
export class SsffTrackComponent implements OnInit {

    private _audio_buffer: AudioBuffer;
    private _crosshair_position: number;
    private _moving_boundaries: Boundary[];
    private _name: string;
    private _selection_sample_start: number;
    private _selection_sample_end: number;
    private _viewport_sample_start: number;
    private _viewport_sample_end: number;

    private _main_context;
    private _markup_context: CanvasRenderingContext2D;
    private assTrackName: string;
    private initialised: boolean = false;

    @Input() set name(value: any) {
        this._name = value;
    }

    @Input() set audio_buffer(value: AudioBuffer) {
        this._audio_buffer = value;
    }

    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.drawSsffTrackMarkup();
    }

    @Input() set moving_boundaries(value: Boundary[]) {
        this._moving_boundaries = value;
        this.drawSsffTrackMarkup();
    }

    @Input() set selection_sample_start(value: number) {
        this._selection_sample_start = value;
        this.drawSsffTrackMarkup();
    }

    @Input() set selection_sample_end(value: number) {
        this._selection_sample_end = value;
        this.drawSsffTrackMarkup();
    }

    @Input() set viewport_sample_start(value: number) {
        this._viewport_sample_start = value;
        this.redraw();
    }

    @Input() set viewport_sample_end(value: number) {
        this._viewport_sample_end = value;
        this.redraw();
    }

    @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
    @Output() selection_change: EventEmitter<{ start: number, end: number }> = new EventEmitter<{ start: number, end: number }>();


    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    @ViewChild('markupCanvas') markupCanvas: ElementRef;

    constructor(private ssff_data_service: SsffDataService,
                private config_provider_service: ConfigProviderService,
                private view_state_service: ViewStateService) {
    }

    ngOnInit() {
        this._main_context = this.mainCanvas.nativeElement.getContext('2d');
        this._markup_context = this.markupCanvas.nativeElement.getContext('2d');

        this.initialised = true;
        this.redraw();
    }

  public mousedown(event: MouseEvent) {
      const sampleAtMousePosition = getSampleNumberAtCanvasMouseEvent(
          event,
          this._viewport_sample_start,
          this._viewport_sample_end
      );

      if (event.shiftKey && this._selection_sample_start !== null) {
          this.selection_change.emit(adjustSelection(
              sampleAtMousePosition,
              this._selection_sample_start,
              this._selection_sample_end
          ));
      } else {
          this.selection_change.emit({start: sampleAtMousePosition, end: sampleAtMousePosition});
      }
  }

  public mousemove(event: MouseEvent){
    this.crosshair_move.emit(getMousePositionInCanvasX(event));

    let mouseButton: number;
    if (event.buttons === undefined) {
        mouseButton = event.which;
    } else {
        mouseButton = event.buttons;
    }

    if (mouseButton === 1) {
        const sampleAtMousePosition = getSampleNumberAtCanvasMouseEvent(
            event,
            this._viewport_sample_start,
            this._viewport_sample_end
        );

        this.selection_change.emit(adjustSelection(
            sampleAtMousePosition,
            this._selection_sample_start,
            this._selection_sample_end
        ));
    }
  }

  // scope.$watch('ssffds.data.length', function () {
  //   if (!$.isEmptyObject(scope.shs)) {
  //     if (!$.isEmptyObject(scope.shs.audioBuffer)) {
  //       scope.drawSsffTrackMarkup();
  //     }
  //   }
  // }, true);

  redraw() {
      this.drawSsffTrackMarkup();
      this.handleUpdate();
  }

  drawSsffTrackMarkup () {
      if (!this.initialised || !this._audio_buffer) {
          return;
      }

      this._markup_context.clearRect(0, 0, this.markupCanvas.nativeElement.width, this.markupCanvas.nativeElement.height);

      drawMovingBoundaryLines(
          this._markup_context,
          this._viewport_sample_start,
          this._viewport_sample_end,
          this._moving_boundaries,
          emuWebappTheme
      );

      drawSelection(
          this._markup_context,
          false,
          this._viewport_sample_start,
          this._viewport_sample_end,
          this._selection_sample_start,
          this._selection_sample_end,
          this._audio_buffer,
          emuWebappTheme
      );

      drawVerticalCrossHair(
          this._markup_context,
          this._crosshair_position,
          this._audio_buffer.sampleRate,
          false,
          this._viewport_sample_start,
          this._viewport_sample_end,
          emuWebappTheme
      );


      // draw min max and name of track
      const tr = this.config_provider_service.getSsffTrackConfig(this._name);
      const col = this.ssff_data_service.getColumnOfTrack(tr.name, tr.columnName);
      if (col) {
          drawMinMaxAndName(this._markup_context, this._name, col._minVal, col._maxVal, 2, emuWebappTheme);
      }

      /*
      var minMaxValLims = scope.cps.getValueLimsOfTrack(tr.name);
      var minVal, maxVal;
      if(!angular.equals(minMaxValLims, {})){
        minVal = minMaxValLims.minVal;
        maxVal = minMaxValLims.maxVal;
      } else {
        minVal = col._minVal;
        maxVal = col._maxVal;
      }
      */
  }

  /**
   *
   */
  handleUpdate() {
    if (!this.initialised || !this._audio_buffer) {
      return;
    }

    this._main_context.fillStyle = emuWebappTheme.canvasBackgroundColor;
    this._main_context.fillRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

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
            let minMaxCountourLims = this.config_provider_service.getContourLimsOfTrack(tr.name, this.view_state_service.curPerspectiveIdx);
            let minMaxValLims = this.config_provider_service.getValueLimsOfTrack(tr.name, this.view_state_service.curPerspectiveIdx);
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

          let minMaxContourLims = this.config_provider_service.getContourLimsOfTrack(tr.name, this.view_state_service.curPerspectiveIdx);
          let minMaxValLims = this.config_provider_service.getValueLimsOfTrack(tr.name, this.view_state_service.curPerspectiveIdx);
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

    // @todo in the old system, startTimeVP allowed a negative value for sample 0. Now, sample 0 starts at time 0. According to spec.
    const startTimeVP = getTimeOfSample(this._viewport_sample_start, this._audio_buffer.sampleRate).start;
    const endTimeVP = getTimeOfSample(this._viewport_sample_end, this._audio_buffer.sampleRate).end;
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
          let contColors = this.config_provider_service.getContourColorsOfTrack(this.assTrackName, this.view_state_service.curPerspectiveIdx);
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
      let firstLine;
      if (nrOfSamples <= 2) {
        firstLine = 'Zoom out to';
      } else {
        firstLine = 'Zoom in to';
      }
      FontScaleService.drawUndistortedTextTwoLines(this._main_context, firstLine, 'see contour(s)', 12, 'HelveticaNeue', canvas.width / 2, canvas.height / 2, 'red', 'center', 'middle');
    }
  }

}
