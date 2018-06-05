import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { ConfigProviderService } from '../_services/config-provider.service';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {

  private _level_annotation: any;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _attributeDefinition: string;

  @Input() set level_annotation(value: string){
    this._level_annotation = value;
    // console.log(value);
    this.redraw();
  }
  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;
    // console.log("setting _viewport_sample_start");
    this.redraw();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;
    // console.log("setting _viewport_sample_end");
    this.redraw();
  }

  @Input() set attributeDefinition(value: any){
    this._attributeDefinition = value;
    // console.log("setting _attributeDefinition");
    this.redraw();
  }

  @ViewChild('levelCanvas') levelCanvas: ElementRef;
  @ViewChild('levelMarkupCanvas') levelMarkupCanvas: ElementRef;


  constructor(private config_provider_service: ConfigProviderService) { }

  ngOnInit() {
  }

//   // select the needed DOM items from the template
//   var canvas = element.find('canvas');
//   scope.open = true; // attr.open; // not using attr.open any more because minification changes open="true" to open
//   scope.vs = viewState;
//   scope.hists = HistoryService;
//   scope.cps = ConfigProviderService;
//   scope.modal = modalService;
//   scope.lmds = loadedMetaDataService;
//   scope.hls = HierarchyLayoutService;
//   scope.ds = DataService;
//   scope.ls = LevelService;
//
//   var levelCanvasContainer = element.find('div');
//   scope.levelDef = ConfigProviderService.getLevelDefinition(scope.level.name);
//   scope.backgroundCanvas = {
//     'background': ConfigProviderService.design.color.lightGrey
//   };
//
//   scope.drawHierarchy = false; //
//
//   ///////////////
//   // watches
//
//   scope.$watch('vs.lastUpdate', function (newValue, oldValue) {
//     if (newValue !== oldValue) {
//       scope.redraw();
//     }
//   });
//
//   //
//   scope.$watch('vs.curViewPort', function (newValue, oldValue) {
//     if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS || oldValue.windowWidth !== newValue.windowWidth) {
//       scope.drawLevelDetails();
//       scope.drawLevelMarkup();
//     } else {
//       scope.drawLevelMarkup();
//     }
//   }, true);
//
//   //
//   scope.$watch('vs.curMouseX', function () {
//     scope.drawLevelMarkup();
//   }, true);
//
//   //
//   scope.$watch('vs.curClickLevelName', function (newValue) {
//     if (newValue !== undefined) {
//       scope.drawLevelMarkup();
//     }
//   }, true);
//
//   //
//   scope.$watch('vs.movingBoundarySample', function () {
//     if (scope.level.name === scope.vs.curMouseLevelName) {
//       scope.drawLevelDetails();
//     }
//     scope.drawLevelMarkup();
//   }, true);
//
//   //
//   scope.$watch('vs.movingBoundary', function () {
//     scope.drawLevelMarkup();
//   }, true);
//
//   //
//   scope.$watch('hists.movesAwayFromLastSave', function () {
//     scope.drawLevelDetails();
//     scope.drawLevelMarkup();
//
//   }, true);
//
//   //
//   scope.$watch('vs.curPerspectiveIdx', function () {
//     scope.drawLevelDetails();
//     scope.drawLevelMarkup();
//   }, true);
//
//   //
//   scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
//     if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
//       scope.drawLevelDetails();
//       scope.drawLevelMarkup();
//     }
//   }, true);
//

  //
  /////////////////

  redraw() {
    this.drawLevelDetails();
    this.drawLevelMarkup();
  }

//   /**
//    *
//    */
//   scope.changeCurAttrDef = function (attrDefName, index) {
//     var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
//     if (curAttrDef !== attrDefName) {
//       // curAttrDef = attrDefName;
//       scope.vs.setCurAttrDef(scope.level.name, attrDefName, index);
//
//       if (!element.hasClass('emuwebapp-level-animation')) {
//         scope.vs.setEditing(false);
//         LevelService.deleteEditArea();
//         $animate.addClass(levelCanvasContainer, 'emuwebapp-level-animation').then(function () {
//           $animate.removeClass(levelCanvasContainer, 'emuwebapp-level-animation');
//           // redraw
//           scope.drawLevelDetails();
//           scope.drawLevelMarkup();
//         });
//       }
//     }
//   };
//
//   /**
//    *
//    */
//   scope.getAttrDefBtnColor = function (attrDefName) {
//     var curColor;
//     var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
//     if (attrDefName === curAttrDef) {
//       curColor = {
//         'background': '-webkit-radial-gradient(50% 50%, closest-corner, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%)'
//       };
//     } else {
//       curColor = {
//         'background-color': 'white'
//       };
//     }
//     return curColor;
//   };
//
//   scope.updateView = function () {
//     if ($.isEmptyObject(scope.cps)) {
//       return;
//     }
//     scope.drawLevelDetails();
//   };
//
//
//   ///////////////
//   // bindings
//
//   // on mouse leave reset viewState.
//   element.bind('mouseleave', function () {
//     scope.vs.setcurMouseItem(undefined, undefined, undefined);
//     scope.drawLevelMarkup();
//   });

  /**
   * draw level details
   */
  drawLevelDetails() {
    // let labelFontFamily; // font family used for labels only
    // let fontFamily = this.config_provider_service.design.font.small.family; // font family used for everything else
    // if(typeof scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.labelFontFamily === 'undefined'){
    //   labelFontFamily = scope.cps.design.font.small.family;
    // }else{
    //   labelFontFamily = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.labelFontFamily;
    // }
    //
    // var labelFontSize; // font family used for labels only
    // var fontSize = ConfigProviderService.design.font.small.size.slice(0, -2) * 1; // font size used for everything else
    // if(typeof scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.fontPxSize === 'undefined') {
    //   labelFontSize = ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
    // }else{
    //   labelFontSize = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.labelFontPxSize;
    // }


    // let curAttrDef = this.vs.getCurAttrDef(scope.level.name);
    // var isOpen = element.parent().css('height') !== '25px';// ? false : true;
    // if ($.isEmptyObject(scope.level)) {
    //   //console.log('undef levelDetails');
    //   return;
    // }
    // if ($.isEmptyObject(scope.vs)) {
    //   //console.log('undef viewState');
    //   return;
    // }
    // if ($.isEmptyObject(scope.cps)) {
    //   //console.log('undef config');
    //   return;
    // }
    //
    // // draw hierarchy if canvas is displayed
    // if(scope.drawHierarchy){
    //   scope.drawHierarchyDetails();
    // }
    //
    //
    let ctx = this.levelCanvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // predef vars
    let sDist, posS, posE;

    sDist = this.getPixelPosition(ctx.canvas.width, this._viewport_sample_start + 1) - this.getPixelPosition(ctx.canvas.width, this._viewport_sample_start); // used to be scope.vs.getSampleDist(ctx.canvas.width);

    // // draw name of level and type
    // var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;
    //
    // if (scope.level.name === curAttrDef) {
    //   if (isOpen) {
    //     fontScaleService.drawUndistortedTextTwoLines(ctx, scope.level.name, '(' + scope.level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, ConfigProviderService.design.color.black, true);
    //   }
    //   else {
    //     fontSize -= 2;
    //     fontScaleService.drawUndistortedText(ctx, scope.level.name, fontSize, fontFamily, 4, ctx.canvas.height / 2 - (fontSize * scaleY / 2), ConfigProviderService.design.color.black, true);
    //   }
    // } else {
    //   fontScaleService.drawUndistortedTextTwoLines(ctx, scope.level.name + ':' + curAttrDef, '(' + scope.level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, ConfigProviderService.design.color.black, true);
    // }
    //
    let curID = -1;
    //
    // // calculate generic max with of single char (m char used)
    // //var mTxtImg = fontScaleService.drawUndistortedText(ctx, 'm', fontSize - 2, labelFontFamily, ConfigProviderService.design.color.black);
    // var mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;
    //
    // // calculate generic max with of single digit (0 digit used)
    // //var zeroTxtImg = fontScaleService.drawUndistortedText(ctx, '0', fontSize - 4, labelFontFamily, ConfigProviderService.design.color.black);
    // var zeroTxtImgWidth = ctx.measureText('0').width * fontScaleService.scaleX;
    if (this._level_annotation.type === 'SEGMENT') {
      ctx.fillStyle = 'black';//ConfigProviderService.design.color.black;
        // draw segments

        this._level_annotation.items.forEach((item) => {
          ++curID;

          if (item.sampleStart >= this._viewport_sample_start &&
            item.sampleStart <= this._viewport_sample_end || //within segment
            item.sampleStart + item.sampleDur > this._viewport_sample_start &&
            item.sampleStart + item.sampleDur < this._viewport_sample_end || //end in segment
            item.sampleStart < this._viewport_sample_start &&
            item.sampleStart + item.sampleDur > this._viewport_sample_end // within sample
          ) {
            // get label
            let curLabVal;
            item.labels.forEach((lab) => {
              if (lab.name === this._attributeDefinition) {
                curLabVal = lab.value;
              }
            });

            // draw segment start
            posS = this.getPixelPosition(ctx.canvas.width, item.sampleStart);
            posE = this.getPixelPosition(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);

            ctx.fillStyle = 'black';//ConfigProviderService.design.color.black;
            ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

            //draw segment end
            ctx.fillStyle = 'grey'; //ConfigProviderService.design.color.grey;
            ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);
      //
      //       ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);
      //
      //       //check for enough space to stroke text
      //       if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
      //         if (isOpen) {
      //           fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - (fontSize - 2) + 2, ConfigProviderService.design.color.black, false);
      //         } else {
      //           fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - fontSize + 2, ConfigProviderService.design.color.black, false);
      //         }
      //       }
      //
            //draw helper lines
            if (true && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty; NOTE true used to be scope.open
              let labelCenter = posS + (posE - posS) / 2;

              let hlY = ctx.canvas.height / 4;
              // start helper line
              ctx.strokeStyle = 'black'; // ConfigProviderService.design.color.black;
              ctx.beginPath();
              ctx.moveTo(posS, hlY);
              ctx.lineTo(labelCenter, hlY);
              ctx.lineTo(labelCenter, hlY + 5);
              ctx.stroke();

              hlY = ctx.canvas.height / 4 * 3;
              // end helper line
              ctx.strokeStyle = 'grey'; //ConfigProviderService.design.color.grey;
              ctx.beginPath();
              ctx.moveTo(posE, hlY);
              ctx.lineTo(labelCenter, hlY);
              ctx.lineTo(labelCenter, hlY - 5);
              ctx.stroke();
            }
      //
      //       if (scope.open){
      //         // draw sampleStart numbers
      //         //check for enough space to stroke text
      //         if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length && isOpen) {
      //           fontScaleService.drawUndistortedText(ctx, item.sampleStart, fontSize - 2, fontFamily, posS + 3, 0, ConfigProviderService.design.color.grey, true);
      //         }
      //
      //         // draw sampleDur numbers.
      //         var durtext = 'dur: ' + item.sampleDur + ' ';
      //         //check for enough space to stroke text
      //         if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
      //           fontScaleService.drawUndistortedText(ctx, durtext, fontSize - 2, fontFamily, posE - (ctx.measureText(durtext).width * fontScaleService.scaleX), ctx.canvas.height / 4 * 3, ConfigProviderService.design.color.grey, true);
      //         }
      //       }
          }
        });

    }else if (this._level_annotation.type === 'EVENT') {
      ctx.fillStyle = 'black'; //ConfigProviderService.design.color.black;
      // predef. vars
      let perc;

      this._level_annotation.items.forEach((item) => {
        if (item.samplePoint > this._viewport_sample_start && item.samplePoint < this._viewport_sample_end) {
          perc = Math.round(this.getPixelPosition(ctx.canvas.width, item.samplePoint) + (sDist / 2));
          // get label
          let curLabVal;
          item.labels.forEach((lab) => {
            if (lab.name === this._attributeDefinition) {
              curLabVal = lab.value;
            }
          });

          ctx.fillStyle = 'black'; //ConfigProviderService.design.color.black;
          ctx.fillRect(perc, 0, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);
          ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);

    //       fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, perc, (ctx.canvas.height / 2) - (fontSize - 2) + 2, ConfigProviderService.design.color.black, false);
    //       if (isOpen) {
    //         fontScaleService.drawUndistortedText(ctx, item.samplePoint, fontSize - 2, labelFontFamily, perc + 5, 0, ConfigProviderService.design.color.grey, true);
    //       }
        }
      });
    }
  };

  /**
   *
   */
  drawLevelMarkup() {
    // var ctx = canvas[1].getContext('2d');
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // if (scope.level.name === scope.vs.getcurClickLevelName()) {
    //   ctx.fillStyle = ConfigProviderService.design.color.transparent.grey;
    //   ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // }
    //
    // // draw moving boundary line if moving
    // Drawhelperservice.drawMovingBoundaryLine(ctx);
    //
    // // draw current viewport selected
    // Drawhelperservice.drawCurViewPortSelected(ctx);
    //
    //
    // var posS, posE, sDist, xOffset, item;
    // posS = scope.vs.getPos(ctx.canvas.width, scope.vs.curViewPort.selectS);
    // posE = scope.vs.getPos(ctx.canvas.width, scope.vs.curViewPort.selectE);
    // sDist = scope.vs.getSampleDist(ctx.canvas.width);
    //
    //
    // var segMId = scope.vs.getcurMouseItem();
    // var isFirst = scope.vs.getcurMouseisFirst();
    // var isLast = scope.vs.getcurMouseisLast();
    // var clickedSegs = scope.vs.getcurClickItems();
    // var levelId = scope.vs.getcurClickLevelName();
    // if (clickedSegs !== undefined) {
    //   // draw clicked on selected areas
    //   if (scope.level.name === levelId && clickedSegs.length > 0) {
    //     clickedSegs.forEach(function (cs) {
    //       if (cs !== undefined) {
    //         // check if segment or event level
    //         if (cs.sampleStart !== undefined) {
    //           posS = Math.round(scope.vs.getPos(ctx.canvas.width, cs.sampleStart));
    //           posE = Math.round(scope.vs.getPos(ctx.canvas.width, cs.sampleStart + cs.sampleDur + 1));
    //         } else {
    //           posS = Math.round(scope.vs.getPos(ctx.canvas.width, cs.samplePoint) + sDist / 2);
    //           posS = posS - 5;
    //           posE = posS + 10;
    //         }
    //         ctx.fillStyle = ConfigProviderService.design.color.transparent.yellow;
    //         ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
    //         ctx.fillStyle = ConfigProviderService.design.color.black;
    //       }
    //     });
    //   }
    // }
    //
    //
    // // draw preselected boundary
    // item = scope.vs.getcurMouseItem();
    // if (scope.level.items.length > 0 && item !== undefined && segMId !== undefined && scope.level.name === scope.vs.getcurMouseLevelName()) {
    //   ctx.fillStyle = ConfigProviderService.design.color.blue;
    //   if (isFirst === true) { // before first segment
    //     if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
    //       item = scope.level.items[0];
    //       posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.sampleStart));
    //       ctx.fillRect(posS, 0, 3, ctx.canvas.height);
    //     }
    //   } else if (isLast === true) { // after last segment
    //     if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
    //       item = scope.level.items[scope.level.items.length - 1];
    //       posS = Math.round(scope.vs.getPos(ctx.canvas.width, (item.sampleStart + item.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
    //       ctx.fillRect(posS, 0, 3, ctx.canvas.height);
    //     }
    //   } else { // in the middle
    //     if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
    //       posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.sampleStart));
    //       ctx.fillRect(posS, 0, 3, ctx.canvas.height);
    //     } else {
    //       posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.samplePoint));
    //       xOffset = (sDist / 2);
    //       ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);
    //
    //     }
    //   }
    //   ctx.fillStyle = ConfigProviderService.design.color.black;
    //
    // }
    //
    // // draw cursor
    // Drawhelperservice.drawCrossHairX(ctx, viewState.curMouseX);
  }
//
//   /**
//    * draw level hierarchy
//    */
//   scope.drawHierarchyDetails = function () {
//     var fontSize = ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
//     var paths = scope.hls.findPaths(scope.level.name);
//     var curPath = paths[1];
//
//     var ctx = canvas[0].getContext('2d');
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//
//     //var mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;
//
//     ctx.strokeStyle = ConfigProviderService.design.color.black;
//
//     // find parents for every parent for every items hence building the annotation graph
//     scope.hls.findParents(curPath);
//
//     // draw ghost level
//     for(var i = 0; i < curPath.length; i++){
//       var curLevel = scope.ls.getLevelDetails(curPath[i]);
//       var levelHeight = ctx.canvas.height / curPath.length;
//       var curStartY = ctx.canvas.height - (i + 1) * levelHeight;
//       for(var itemIdx = 0; itemIdx < curLevel.items.length; itemIdx++){
//         var posS = Math.round(scope.vs.getPos(ctx.canvas.width, curLevel.items[itemIdx]._derivedSampleStart));
//         var posE = Math.round(scope.vs.getPos(ctx.canvas.width, curLevel.items[itemIdx]._derivedSampleEnd));
//         ctx.strokeRect(posS, curStartY , posE - posS, curStartY + levelHeight);
//
//         // draw label
//         fontScaleService.drawUndistortedText(ctx, curLevel.items[itemIdx].labels[0].value, fontSize - 2, ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - ctx.measureText(curLevel.items[itemIdx].labels[0].value).width / 2 - 2, curStartY + levelHeight / 2, ConfigProviderService.design.color.black, true);
//       }
//     }
//
//   };
//
// }
// };

  /**
   * get pixel position in current viewport given the canvas width
   * NOTE: duplicate of viewport! Good idea?
   * @param w is width of canvas
   * @param s is current sample to convert to pixel value
   */
  getPixelPosition(w, s) {
    return (w * (s - this._viewport_sample_start) / (this._viewport_sample_end - this._viewport_sample_start + 1)); // + 1 because of view (displays all samples in view)
  }

}
