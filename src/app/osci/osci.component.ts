import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import { DrawHelperService } from '../_services/draw-helper.service'

@Component({
  selector: 'app-osci',
  templateUrl: './osci.component.html',
  styleUrls: ['./osci.component.scss']
})
export class OsciComponent implements OnInit {

  private _audio_buffer: AudioBuffer;
  private _channel: number;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;

  @Input() set audio_buffer(value: AudioBuffer){
    this._audio_buffer = value;
    console.log(value);
  }

  @Input() set channel(value: number) {
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
    if(this._viewport_sample_end !== 0){ // SIC this has to be done better!
      this.draw_helper_service.freshRedrawDrawOsciOnCanvas(
        this.mainCanvas.nativeElement,
        this._viewport_sample_start,
        this._viewport_sample_end,
      false,
        // @todo make sure this._audio_buffer is set before this._viewport_sample_end
        this._audio_buffer,
        this._channel
      );
    }
  }


  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  // @ViewChild('levelMarkupCanvas') levelMarkupCanvas: ElementRef;

  constructor(private draw_helper_service: DrawHelperService) { }

  ngOnInit() {
  }

  // // select the needed DOM elements from the template
  // var canvasLength = element.find('canvas').length;
  // var canvas = element.find('canvas')[0];
  // var markupCanvas = element.find('canvas')[canvasLength - 1];
  // // assign attributes to scope
  // scope.order = attrs.order;
  // scope.trackName = attrs.trackName;
  // scope.cps = ConfigProviderService;
  // scope.viewState = viewState;
  // scope.lmds = loadedMetaDataService;
  //
  // ///////////////
  // // watches
  //
  // //
  // scope.$watch('viewState.osciSettings', function () {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, viewState.curViewPort.sS, viewState.curViewPort.eS, false);
  //       scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //     }
  //   }
  //
  // }, true);
  //
  //
  // //
  // scope.$watch('viewState.lastUpdate', function (newValue, oldValue) {
  //   if (newValue !== oldValue) {
  //     scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //   }
  // });
  //
  // //
  // scope.$watch('viewState.timelineSize', function () {
  //   $timeout(scope.redraw, ConfigProviderService.design.animation.duration);
  // });
  //
  // //
  // scope.$watch('viewState.curPerspectiveIdx', function () {
  //   scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  // }, true);
  //
  // //
  // scope.$watch('viewState.playHeadAnimationInfos', function () {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       scope.drawPlayHead(scope, ConfigProviderService);
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('viewState.movingBoundarySample', function () {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('viewState.curMouseX', function () {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       // only draw corsshair x line if mouse currently not over canvas
  //       if(viewState.curMouseTrackName !== scope.trackName) {
  //         scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //       }
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('viewState.movingBoundary', function () {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('viewState.curViewPort', function (newValue, oldValue) {
  //   if (!$.isEmptyObject(Soundhandlerservice)) {
  //     if (!$.isEmptyObject(Soundhandlerservice.audioBuffer)) {
  //       // check for changed zoom
  //       if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
  //         Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, viewState.curViewPort.sS, viewState.curViewPort.eS, false);
  //       }
  //       scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  //     }
  //   }
  // }, true);
  //
  // //
  // scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
  //   if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
  //     Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, viewState.curViewPort.sS, viewState.curViewPort.eS, true);
  //   }
  // }, true);
  //
  // //
  // /////////////////////////
  //
  // scope.redraw = function () {
  //   scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
  // };
  //
  // /**
  //  *
  //  */
  // scope.drawPlayHead = function (scope, config) {
  //   var ctx = markupCanvas.getContext('2d');
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   var posS = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.sS);
  //   var posCur = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.curS);
  //   ctx.fillStyle = ConfigProviderService.design.color.transparent.grey;
  //   ctx.fillRect(posS, 0, posCur - posS, canvas.height);
  //   scope.drawVpOsciMarkup(scope, config, false);
  // };
  //
  // /**
  //  * draws markup of osci according to
  //  * the information that is specified in
  //  * the viewport
  //  */
  // scope.drawVpOsciMarkup = function (scope, config, reset) {
  //   var ctx = markupCanvas.getContext('2d');
  //   if (reset) {
  //     ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
  //   }
  //   // draw moving boundary line if moving
  //   Drawhelperservice.drawMovingBoundaryLine(ctx);
  //   @todo add this._viewport_sample_start, this._viewport_sample_end, and this._audio_buffer.sampleRate as parameters to drawViewPortTimes
  //   Drawhelperservice.drawViewPortTimes(ctx, true);
  //   // draw current viewport selected
  //   Drawhelperservice.drawCurViewPortSelected(ctx, true);
  //
  //   Drawhelperservice.drawCrossHairX(ctx, viewState.curMouseX);
  // };
// }

}
