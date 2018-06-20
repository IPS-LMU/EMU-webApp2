import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { ConfigProviderService } from '../_services/config-provider.service';
import { FontScaleService } from '../_services/font-scale.service';
import { ViewStateService } from '../_services/view-state.service';
import { LevelService } from '../_services/level.service';
import { HistoryService } from '../_services/history.service';
import { DrawHelperService } from '../_services/draw-helper.service';
import {ILevel} from '../_interfaces/annot-json.interface';
import {DataService} from '../_services/data.service';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {

  private _level_annotation: ILevel;
  private _attributeDefinition: string;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _external_cursor_sample_position: number;
  private _audio_sample_length: number;

  private lasteditArea: string = null; // holding current edit area
  private lasteditAreaElem: HTMLElement = null; // holding current edit area element
  /**
   * Getter for id of last edited Element
   *   @return lasteditAreaElem last edit Area
   */
  public getlastID () {
      return parseInt(this.lasteditArea.substr(1));
  }


  // mouse handeling lets
  lastEventClick: any;
  lastEventMove: any;
  lastNeighboursMove: any;
  lastPCM: any;
  curMouseSampleNrInView: any;
  // order = attr.trackMouseInLevel;

  @Input() set level_annotation(value: ILevel){
    this._level_annotation = value;
    // console.log(value);
    // this.redraw();
  }
  @Input() set attributeDefinition(value: any){
    this._attributeDefinition = value;
    // console.log("setting _attributeDefinition");
    // this.redraw();
  }
  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;
    // console.log("setting _viewport_sample_start");
    // this.redraw();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;
    // console.log("setting _viewport_sample_end");
    this.redraw();
  }
  @Input() set external_cursor_sample_position(value: number){
    this._external_cursor_sample_position = value;
    // console.log("setting _viewport_sample_end");
    this.drawLevelMarkup();
  }
  @Input() set audio_sample_length(value: number){
    this._audio_sample_length = value;
    // console.log("setting _viewport_sample_end");
    // this.drawLevelMarkup();
  }



  @ViewChild('levelCanvas') levelCanvas: ElementRef;
  @ViewChild('levelMarkupCanvas') levelMarkupCanvas: ElementRef;


  constructor(private config_provider_service: ConfigProviderService,
              private font_scale_service: FontScaleService,
              private view_state_service: ViewStateService,
              private data_service: DataService,
              private history_service: HistoryService,
              private draw_helper_service: DrawHelperService,
              private element_ref: ElementRef) { }

  ngOnInit() {
  }

//   // select the needed DOM items from the template
//   let canvas = element.find('canvas');
//   this.open = true; // attr.open; // not using attr.open any more because minification changes open="true" to open
//   this.vs = this.view_state_service;
//   this.hists = HistoryService;
//   this.cps = ConfigProviderService;
//   this.modal = modalService;
//   this.lmds = loadedMetaDataService;
//   this.hls = HierarchyLayoutService;
//   this.ds = DataService;
//   this.ls = this.level_service;
//
//   let levelCanvasContainer = element.find('div');
//   this.levelDef = ConfigProviderService.getLevelDefinition(this.level.name);
//   this.backgroundCanvas = {
//     'background': ConfigProviderService.design.color.lightGrey
//   };
//
//   this.drawHierarchy = false; //
//
//   ///////////////
//   // watches
//
//   this.$watch('vs.lastUpdate', function (newValue, oldValue) {
//     if (newValue !== oldValue) {
//       this.redraw();
//     }
//   });
//
//   //
//   this.$watch('vs.curViewPort', function (newValue, oldValue) {
//     if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS || oldValue.windowWidth !== newValue.windowWidth) {
//       this.drawLevelDetails();
//       this.drawLevelMarkup();
//     } else {
//       this.drawLevelMarkup();
//     }
//   }, true);
//
//   //
//   this.$watch('vs.curMouseX', function () {
//     this.drawLevelMarkup();
//   }, true);
//
//   //
//   this.$watch('vs.curClickLevelName', function (newValue) {
//     if (newValue !== undefined) {
//       this.drawLevelMarkup();
//     }
//   }, true);
//
//   //
//   this.$watch('vs.movingBoundarySample', function () {
//     if (this.level.name === this.vs.curMouseLevelName) {
//       this.drawLevelDetails();
//     }
//     this.drawLevelMarkup();
//   }, true);
//
//   //
//   this.$watch('vs.movingBoundary', function () {
//     this.drawLevelMarkup();
//   }, true);
//
//   //
//   this.$watch('hists.movesAwayFromLastSave', function () {
//     this.drawLevelDetails();
//     this.drawLevelMarkup();
//
//   }, true);
//
//   //
//   this.$watch('vs.curPerspectiveIdx', function () {
//     this.drawLevelDetails();
//     this.drawLevelMarkup();
//   }, true);
//
//   //
//   this.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
//     if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
//       this.drawLevelDetails();
//       this.drawLevelMarkup();
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
//   this.changeCurAttrDef = function (attrDefName, index) {
//     let curAttrDef = this.vs.getCurAttrDef(this.level.name);
//     if (curAttrDef !== attrDefName) {
//       // curAttrDef = attrDefName;
//       this.vs.setCurAttrDef(this.level.name, attrDefName, index);
//
//       if (!element.hasClass('emuwebapp-level-animation')) {
//         this.vs.setEditing(false);
//         this.deleteEditArea();
//         $animate.addClass(levelCanvasContainer, 'emuwebapp-level-animation').then(function () {
//           $animate.removeClass(levelCanvasContainer, 'emuwebapp-level-animation');
//           // redraw
//           this.drawLevelDetails();
//           this.drawLevelMarkup();
//         });
//       }
//     }
//   };
//
//   /**
//    *
//    */
//   this.getAttrDefBtnColor = function (attrDefName) {
//     let curColor;
//     let curAttrDef = this.vs.getCurAttrDef(this.level.name);
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
//   this.updateView = function () {
//     if ($.isEmptyObject(this.cps)) {
//       return;
//     }
//     this.drawLevelDetails();
//   };
//
//
//   ///////////////
//   // bindings
//
//   // on mouse leave reset this.view_state_service.
//   element.bind('mouseleave', function () {
//     this.vs.setcurMouseItem(undefined, undefined, undefined);
//     this.drawLevelMarkup();
//   });

  /////////////////////
  // handle mouse events

  mouseclick(event){
    event.preventDefault();
    this.setLastMove(event, true);
    this.setLastClick(event);
  }

  mousedblclick(){
    this.setLastMove(event, true);
    if (this.config_provider_service.vals.restrictions.editItemName) {
      this.setLastDblClick(event);
    } else {
      this.setLastClick(event);
    }
  }

  mousemove(event){
    // console.log(event);
    let moveLine, moveBy;
    if (this.view_state_service.focusOnEmuWebApp) {
      if (!this.view_state_service.getdragBarActive()) {
        moveLine = true;
        let samplesPerPixel = this.view_state_service.getSamplesPerPixelVal(event);
        this.curMouseSampleNrInView = this.view_state_service.getX(event) * samplesPerPixel;
        moveBy = (this.curMouseSampleNrInView - this.lastPCM);
        if (samplesPerPixel <= 1) {
          let zoomEventMove = LevelService.getClosestItem(this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS, this._level_annotation, this._audio_sample_length);
          // absolute movement in pcm below 1 pcm per pixel
          if (this._level_annotation.type === 'SEGMENT') {
            if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) { // before first elem
              moveBy = Math.ceil((this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS) - this._level_annotation.items[0].sampleStart);
            } else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) { // after last elem
              let lastItem = this._level_annotation.items[this._level_annotation.items.length - 1];
              moveBy = Math.ceil((this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS) - lastItem.sampleStart - lastItem.sampleDur);
            } else {
              moveBy = Math.ceil((this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS) - LevelService.getItemFromLevelById(this._level_annotation, zoomEventMove.nearest.id).sampleStart);
            }
          } else {
            moveBy = Math.ceil((this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS) - LevelService.getItemFromLevelById(this._level_annotation, zoomEventMove.nearest.id).samplePoint - 0.5); // 0.5 to break between samples not on
          }
        } else {
          // relative movement in pcm above 1 pcm per pixel
          moveBy = Math.round(this.curMouseSampleNrInView - this.lastPCM);
        }
      }

      let mbutton = 0;
      if (event.buttons === undefined) {
        mbutton = event.which;
      } else {
        mbutton = event.buttons;
      }
      switch (mbutton) {
        case 1:
          //console.log('Left mouse button pressed');
          break;
        case 2:
          //console.log('Middle mouse button pressed');
          break;
        case 3:
          //console.log('Right mouse button pressed');
          break;
        default:
          if (!this.view_state_service.getdragBarActive()) {
            let curMouseItem = this.view_state_service.getcurMouseItem();
            let seg;
            if (this.config_provider_service.vals.restrictions.editItemSize && event.shiftKey) {
              this.deleteEditArea();
              if (curMouseItem !== undefined) {
                this.view_state_service.movingBoundary = true;
                if (this._level_annotation.type === 'SEGMENT') {
                  if (this.view_state_service.getcurMouseisFirst() || this.view_state_service.getcurMouseisLast()) {
                    // before first segment
                    if (this.view_state_service.getcurMouseisFirst()) {
                      seg = this._level_annotation.items[0];
                      this.view_state_service.movingBoundarySample = seg.sampleStart + moveBy;
                    } else if (this.view_state_service.getcurMouseisLast()) {
                      seg = this._level_annotation.items[this._level_annotation.items.length - 1];
                      this.view_state_service.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                    }
                  } else {
                    this.view_state_service.movingBoundarySample = curMouseItem.sampleStart + moveBy;
                    seg = curMouseItem;
                  }
                  LevelService.moveBoundary(
                    this._level_annotation,
                    seg.id,
                    moveBy,
                    this.view_state_service.getcurMouseisFirst(),
                    this.view_state_service.getcurMouseisLast(),
                    this.view_state_service.getCurAttrDef(this._level_annotation.name),
                    this.audio_sample_length
                  );
                  this.history_service.updateCurChangeObj({
                    'type': 'ANNOT',
                    'action': 'MOVEBOUNDARY',
                    'name': this._level_annotation.name,
                    'id': seg.id,
                    'movedBy': moveBy,
                    'isFirst': this.view_state_service.getcurMouseisFirst(),
                    'isLast': this.view_state_service.getcurMouseisLast()
                  });

                } else {
                  seg = curMouseItem;
                  this.view_state_service.movingBoundarySample = curMouseItem.samplePoint + moveBy;
                  LevelService.moveEvent(this._level_annotation, seg.id, moveBy, this.view_state_service.getCurAttrDef(this._level_annotation.name), this.audio_sample_length);
                  this.history_service.updateCurChangeObj({
                    'type': 'ANNOT',
                    'action': 'MOVEEVENT',
                    'name': this._level_annotation.name,
                    'id': seg.id,
                    'movedBy': moveBy
                  });
                }
                this.lastPCM = this.curMouseSampleNrInView;
                this.view_state_service.setLastPcm(this.lastPCM);
                this.view_state_service.selectBoundary();
                moveLine = false;
              }
            } else if (this.config_provider_service.vals.restrictions.editItemSize && event.altKey) {
              this.deleteEditArea();
              if (this._level_annotation.type === 'SEGMENT') {
                seg = this.view_state_service.getcurClickItems();
                if (seg[0] !== undefined) {
                  LevelService.moveSegment(this._level_annotation, seg[0].id, seg.length, moveBy, this.view_state_service.getCurAttrDef(this._level_annotation.name), this.audio_sample_length);
                  this.history_service.updateCurChangeObj({
                    'type': 'ANNOT',
                    'action': 'MOVESEGMENT',
                    'name': this._level_annotation.name,
                    'id': seg[0].id,
                    'length': seg.length,
                    'movedBy': moveBy
                  });
                }
                this.lastPCM = this.curMouseSampleNrInView;
                this.view_state_service.setLastPcm(this.lastPCM);
                this.view_state_service.selectBoundary();
              }
              else if (this._level_annotation.type === 'EVENT') {
                seg = this.view_state_service.getcurClickItems();
                if (seg[0] !== undefined) {
                  seg.forEach((s) => {
                    LevelService.moveEvent(this._level_annotation, s.id, moveBy, this.view_state_service.getCurAttrDef(this._level_annotation.name), this.audio_sample_length);
                    this.history_service.updateCurChangeObj({
                      'type': 'ANNOT',
                      'action': 'MOVEEVENT',
                      'name': this._level_annotation.name,
                      'id': s.id,
                      'movedBy': moveBy
                    });
                  });
                }
                this.lastPCM = this.curMouseSampleNrInView;
                this.view_state_service.setLastPcm(this.lastPCM);
                this.view_state_service.selectBoundary();
              }
            } else {
              this.view_state_service.movingBoundary = false;
            }
          }
          break;
      }
      if (!this.view_state_service.getdragBarActive()) {
        this.setLastMove(event, moveLine);
      }
    }
  }

  /**
   *
   */
  setLastClick (x) {
    this.curMouseSampleNrInView = this.view_state_service.getX(x) * this.view_state_service.getSamplesPerPixelVal(x);
    this.deleteEditArea();
    this.view_state_service.setEditing(false);
    this.lastEventClick = LevelService.getClosestItem(this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS, this._level_annotation, this._audio_sample_length);
    this.view_state_service.setcurClickLevel(this._level_annotation.name, this._level_annotation.type);
    if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined) {
      this.lasteditArea =  '_' + this.lastEventClick.current.id;
      this.lasteditAreaElem = this.element_ref.nativeElement.parentElement;
      this.view_state_service.setcurClickItem(this.lastEventClick.current);
      this.view_state_service.selectBoundary();
    }
    this.lastPCM = this.curMouseSampleNrInView;
    this.view_state_service.setLastPcm(this.lastPCM);
  }

  /**
   *
   */
  setLastRightClick (x) {
    if (this.view_state_service.getcurClickLevelName() !== this._level_annotation) {
      this.setLastClick(x);
    }
    this.curMouseSampleNrInView = this.view_state_service.getX(x) * this.view_state_service.getSamplesPerPixelVal(x);
    this.deleteEditArea();
    this.lastEventClick = LevelService.getClosestItem(this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS, this._level_annotation, this._audio_sample_length);
    if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined) {
      let next = LevelService.getItemInTime(this.data_service.getLevelDataByName(this.view_state_service.getcurClickLevelName()), this.lastEventClick.current.id, true);
      let prev = LevelService.getItemInTime(this.data_service.getLevelDataByName(this.view_state_service.getcurClickLevelName()), this.lastEventClick.current.id, false);
      this.view_state_service.setcurClickLevel(this._level_annotation.name, this._level_annotation.type);
      this.view_state_service.setcurClickItemMultiple(this.lastEventClick.current, next); // also used to pass in  prev
      this.view_state_service.selectBoundary();
    }
    this.lastPCM = this.curMouseSampleNrInView;
    this.view_state_service.setLastPcm(this.lastPCM);
    // this.$apply();
  };

  /**
   *
   */
  setLastDblClick (x) {
    this.curMouseSampleNrInView = this.view_state_service.getX(x) * this.view_state_service.getSamplesPerPixelVal(x);
    this.lastEventClick = LevelService.getClosestItem(this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS, this._level_annotation, this._audio_sample_length);
    // let isOpen = this.element_ref.nativeElement.parentElement.css('height') === '25px' ? false : true;
    // expand to full size on dbl click if level is in small size
    // if (!isOpen) {
    //   this.element_ref.nativeElement.parentElement.find('div')[3].click();
    // }
    if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined && this.view_state_service.getPermission('labelAction')) {
      if (this._level_annotation.type === 'SEGMENT') {
        if (this.lastEventClick.current.sampleStart >= this.view_state_service.curViewPort.sS) {
          if ((this.lastEventClick.current.sampleStart + this.lastEventClick.current.sampleDur) <= this.view_state_service.curViewPort.eS) {
            this.view_state_service.setcurClickLevel(this._level_annotation.name, this._level_annotation.type);
            this.view_state_service.setcurClickItem(this.lastEventClick.current);
            this.lasteditArea = '_' + this.lastEventClick.current.id;
            this.lasteditAreaElem = this.element_ref.nativeElement.parentElement;
            this.view_state_service.setEditing(true);
            this.openEditArea(this.lastEventClick.current, this.element_ref.nativeElement.parentElement, this._level_annotation.name);
          } else {
            //console.log('Editing out of right bound !');
          }
        } else {
          //console.log('Editing out of left bound !');
        }
      } else {
        this.view_state_service.setcurClickLevel(this._level_annotation.name, this._level_annotation.type);
        this.view_state_service.setcurClickItem(this.lastEventClick.current);
        this.lasteditArea = '_' + this.lastEventClick.current.id;
        this.lasteditAreaElem = this.element_ref.nativeElement.parentElement;
        this.view_state_service.setEditing(true);
        this.openEditArea(this.lastEventClick.current, this.element_ref.nativeElement.parentElement, this._level_annotation.name);
        this.view_state_service.setEditing(true);
      }
    }
    this.lastPCM = this.curMouseSampleNrInView;
    this.view_state_service.setLastPcm(this.lastPCM);
  };

  /**
   *
   */
  setLastMove (x, doChange) {
    this.curMouseSampleNrInView = this.view_state_service.getX(x) * this.view_state_service.getSamplesPerPixelVal(x);
    this.lastEventMove = LevelService.getClosestItem(this.curMouseSampleNrInView + this.view_state_service.curViewPort.sS, this._level_annotation, this._audio_sample_length);
    if (doChange) {
      if (this.lastEventMove.current !== undefined && this.lastEventMove.nearest !== undefined) {
        this.lastNeighboursMove = LevelService.getItemNeighboursFromLevel(this._level_annotation, this.lastEventMove.nearest.id, this.lastEventMove.nearest.id);
        this.view_state_service.setcurMouseItem(this.lastEventMove.nearest, this.lastNeighboursMove, this.view_state_service.getX(x), this.lastEventMove.isFirst, this.lastEventMove.isLast);
      }
    }
    this.view_state_service.setcurMouseLevelName(this._level_annotation.name);
    this.view_state_service.setcurMouseLevelType(this._level_annotation.type);
    this.lastPCM = this.curMouseSampleNrInView;
    this.view_state_service.setLastPcm(this.lastPCM);
  }


  // end mouse handeling
  /////////////////


  /**
   * draw level details
   */
  drawLevelDetails() {
    let labelFontFamily; // font family used for labels only
    let fontFamily = 'HelveticaNeue'; //this.config_provider_service.design.font.small.family; // font family used for everything else
    if(typeof this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily === 'undefined'){
      labelFontFamily = 'HelveticaNeue';//this.config_provider_service.design.font.small.family;
    }else{
      labelFontFamily = this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily;
    }

    let labelFontSize; // font family used for labels only
    let fontSize = 12; //this.config_provider_service.design.font.small.size.slice(0, -2) * 1; // font size used for everything else
    if(typeof this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.fontPxSize === 'undefined') {
      labelFontSize = 12;//this.config_provider_service.design.font.small.size.slice(0, -2) * 1;
    }else{
      labelFontSize = this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontPxSize;
    }


    // let curAttrDef = this.vs.getCurAttrDef(this.level.name);
    // let isOpen = element.parent().css('height') !== '25px';// ? false : true;
    // if ($.isEmptyObject(this.level)) {
    //   //console.log('undef levelDetails');
    //   return;
    // }
    // if ($.isEmptyObject(this.vs)) {
    //   //console.log('undef this.view_state_service');
    //   return;
    // }
    // if ($.isEmptyObject(this.cps)) {
    //   //console.log('undef config');
    //   return;
    // }
    //
    // // draw hierarchy if canvas is displayed
    // if(this.drawHierarchy){
    //   this.drawHierarchyDetails();
    // }

    let ctx = this.levelCanvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // predef lets
    let sDist, posS, posE;

    sDist = this.getPixelPosition(ctx.canvas.width, this._viewport_sample_start + 1) - this.getPixelPosition(ctx.canvas.width, this._viewport_sample_start); // used to be this.vs.getSampleDist(ctx.canvas.width);

    // draw name of level and type
    let scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

    if (this._level_annotation.name === this._attributeDefinition) {
    //   if (isOpen) {
        this.font_scale_service.drawUndistortedTextTwoLines(ctx, this._level_annotation.name, '(' + this._level_annotation.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, 'black', true);
    //   }
    //   else {
    //     fontSize -= 2;
    //     fontScaleService.drawUndistortedText(ctx, this.level.name, fontSize, fontFamily, 4, ctx.canvas.height / 2 - (fontSize * scaleY / 2), this.config_provider_service.design.color.black, true);
    //   }
    // } else {
    //   fontScaleService.drawUndistortedTextTwoLines(ctx, this.level.name + ':' + curAttrDef, '(' + this.level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, this.config_provider_service.design.color.black, true);
    }

    let curID = -1;

    // calculate generic max with of single char (m char used)
    //let mTxtImg = fontScaleService.drawUndistortedText(ctx, 'm', fontSize - 2, labelFontFamily, this.config_provider_service.design.color.black);
    let mTxtImgWidth = ctx.measureText('m').width * this.font_scale_service.scaleX;

    // calculate generic max with of single digit (0 digit used)
    //let zeroTxtImg = fontScaleService.drawUndistortedText(ctx, '0', fontSize - 4, labelFontFamily, this.config_provider_service.design.color.black);
    let zeroTxtImgWidth = ctx.measureText('0').width * this.font_scale_service.scaleX;
    if (this._level_annotation.type === 'SEGMENT') {
      ctx.fillStyle = 'black';//this.config_provider_service.design.color.black;
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

            ctx.fillStyle = 'black';//this.config_provider_service.design.color.black;
            ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

            //draw segment end
            ctx.fillStyle = 'grey'; //this.config_provider_service.design.color.grey;
            ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

            ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);

            //check for enough space to stroke text
            if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
      //         if (isOpen) {
                this.font_scale_service.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - (fontSize - 2) + 2, 'black', false);
      //         } else {
      //           fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - fontSize + 2, this.config_provider_service.design.color.black, false);
      //         }
            }

            //draw helper lines
            if (true && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty; NOTE true used to be this.open
              let labelCenter = posS + (posE - posS) / 2;

              let hlY = ctx.canvas.height / 4;
              // start helper line
              ctx.strokeStyle = 'black'; // this.config_provider_service.design.color.black;
              ctx.beginPath();
              ctx.moveTo(posS, hlY);
              ctx.lineTo(labelCenter, hlY);
              ctx.lineTo(labelCenter, hlY + 5);
              ctx.stroke();

              hlY = ctx.canvas.height / 4 * 3;
              // end helper line
              ctx.strokeStyle = 'grey'; //this.config_provider_service.design.color.grey;
              ctx.beginPath();
              ctx.moveTo(posE, hlY);
              ctx.lineTo(labelCenter, hlY);
              ctx.lineTo(labelCenter, hlY - 5);
              ctx.stroke();
            }
      //
      //       if (this.open){
              // draw sampleStart numbers
              //check for enough space to stroke text
              if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length) {
                this.font_scale_service.drawUndistortedText(ctx, item.sampleStart, fontSize - 2, fontFamily, posS + 3, 0, 'grey', true);
              }

              // draw sampleDur numbers.
              let durtext = 'dur: ' + item.sampleDur + ' ';
              //check for enough space to stroke text
              if (posE - posS > zeroTxtImgWidth * durtext.length) {
                this.font_scale_service.drawUndistortedText(ctx, durtext, fontSize - 2, fontFamily, posE - (ctx.measureText(durtext).width * this.font_scale_service.scaleX), ctx.canvas.height / 4 * 3, 'grey', true);
              }
      //       }
          }
        });

    }else if (this._level_annotation.type === 'EVENT') {
      ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
      // predef. lets
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

          ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
          ctx.fillRect(perc, 0, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);
          ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);

          this.font_scale_service.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, perc, (ctx.canvas.height / 2) - (fontSize - 2) + 2, 'black', false);
    //       if (isOpen) {
            this.font_scale_service.drawUndistortedText(ctx, item.samplePoint, fontSize - 2, labelFontFamily, perc + 5, 0, 'grey', true);
    //       }
        }
      });
    }
  }

  /**
   *
   */
  drawLevelMarkup() {
    // console.log()
    let ctx = this.levelMarkupCanvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (this._level_annotation.name === this.view_state_service.getcurClickLevelName()) {
      ctx.fillStyle = 'rgba(22, 22, 22, 0.1)'; //this.config_provider_service.design.color.transparent.grey;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // draw moving boundary line if moving
    this.draw_helper_service.drawMovingBoundaryLine(ctx);

    // draw current viewport selected
    this.draw_helper_service.drawCurViewPortSelected(ctx, false);


    let posS, posE, sDist, xOffset, item;
    posS = this.view_state_service.getPos(ctx.canvas.width, this.view_state_service.curViewPort.selectS);
    posE = this.view_state_service.getPos(ctx.canvas.width, this.view_state_service.curViewPort.selectE);
    sDist = this.view_state_service.getSampleDist(ctx.canvas.width);


    let segMId = this.view_state_service.getcurMouseItem();
    let isFirst = this.view_state_service.getcurMouseisFirst();
    let isLast = this.view_state_service.getcurMouseisLast();
    let clickedSegs = this.view_state_service.getcurClickItems();
    let levelId = this.view_state_service.getcurClickLevelName();

    if (clickedSegs !== undefined) {
      // draw clicked on selected areas
      if (this._level_annotation.name === levelId && clickedSegs.length > 0) {
        clickedSegs.forEach((cs) => {
          if (cs !== undefined) {
            // check if segment or event level
            if (cs.sampleStart !== undefined) {
              posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, cs.sampleStart));
              posE = Math.round(this.view_state_service.getPos(ctx.canvas.width, cs.sampleStart + cs.sampleDur + 1));
            } else {
              posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, cs.samplePoint) + sDist / 2);
              posS = posS - 5;
              posE = posS + 10;
            }
            ctx.fillStyle = 'rgba(255, 255, 22, 0.35)';//this.config_provider_service.design.color.transparent.yellow;
            ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
            ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
          }
        });
      }
    }


    // draw preselected boundary
    item = this.view_state_service.getcurMouseItem();
    if (this._level_annotation.items.length > 0 && item !== undefined && segMId !== undefined && this._level_annotation.name === this.view_state_service.getcurMouseLevelName()) {
      ctx.fillStyle = '#4fc3f7'; //this.config_provider_service.design.color.blue;
      if (isFirst === true) { // before first segment
        if (this.view_state_service.getcurMouseLevelType() === 'SEGMENT') {
          item = this._level_annotation.items[0];
          posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, item.sampleStart));
          ctx.fillRect(posS, 0, 3, ctx.canvas.height);
        }
      } else if (isLast === true) { // after last segment
        if (this.view_state_service.getcurMouseLevelType() === 'SEGMENT') {
          item = this._level_annotation.items[this._level_annotation.items.length - 1];
          posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, (item.sampleStart + item.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
          ctx.fillRect(posS, 0, 3, ctx.canvas.height);
        }
      } else { // in the middle
        if (this.view_state_service.getcurMouseLevelType() === 'SEGMENT') {
          posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, item.sampleStart));
          ctx.fillRect(posS, 0, 3, ctx.canvas.height);
        } else {
          posS = Math.round(this.view_state_service.getPos(ctx.canvas.width, item.samplePoint));
          xOffset = (sDist / 2);
          ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);

        }
      }
      ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;

    }

    // draw cursor
    this.draw_helper_service.drawCrossHairX(ctx, this.view_state_service.curMouseX);
  }

//   /**
//    * draw level hierarchy
//    */
//   this.drawHierarchyDetails = function () {
//     let fontSize = this.config_provider_service.design.font.small.size.slice(0, -2) * 1;
//     let paths = this.hls.findPaths(this.level.name);
//     let curPath = paths[1];
//
//     let ctx = canvas[0].getContext('2d');
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//
//     //let mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;
//
//     ctx.strokeStyle = this.config_provider_service.design.color.black;
//
//     // find parents for every parent for every items hence building the annotation graph
//     this.hls.findParents(curPath);
//
//     // draw ghost level
//     for(let i = 0; i < curPath.length; i++){
//       let curLevel = this.ls.getLevelDetails(curPath[i]);
//       let levelHeight = ctx.canvas.height / curPath.length;
//       let curStartY = ctx.canvas.height - (i + 1) * levelHeight;
//       for(let itemIdx = 0; itemIdx < curLevel.items.length; itemIdx++){
//         let posS = Math.round(this.vs.getPos(ctx.canvas.width, curLevel.items[itemIdx]._derivedSampleStart));
//         let posE = Math.round(this.vs.getPos(ctx.canvas.width, curLevel.items[itemIdx]._derivedSampleEnd));
//         ctx.strokeRect(posS, curStartY , posE - posS, curStartY + levelHeight);
//
//         // draw label
//         fontScaleService.drawUndistortedText(ctx, curLevel.items[itemIdx].labels[0].value, fontSize - 2, this.config_provider_service.design.font.small.family, posS + (posE - posS) / 2 - ctx.measureText(curLevel.items[itemIdx].labels[0].value).width / 2 - 2, curStartY + levelHeight / 2, this.config_provider_service.design.color.black, true);
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

  /**
   * create a html textarea element at given
   * @param element to prepend textarea to
   * @param x the x Position
   * @param y the y Position
   * @param width the Width
   * @param height the Height
   * @param label the Text Content of the Textarea
   * @param labelid the id of the element
   */
  private createEditAreaElement (element, x, y, width, height, label, labelid) {
      let textid = '_' + labelid;
      let cssObj = {
          'left': Math.round(x + 2) + 'px',
          'top': Math.round(y + 1) + 'px',
          'width': Math.round(width) - 2 + 'px',
          'height': Math.round(height) - 20 + 'px',
          'padding-top': Math.round(height / 3 + 1) + 'px'
      };
      // add custom label font to CSS if specified
      /*
       @todo just remove this freaking custom font stuff
      if(typeof this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily !== 'undefined'){
        cssObj['font-family'] = this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily;
      }
      */
      console.error("should prepend texarea");
      // element.prepend($('<textarea>').attr({
      //   id: textid,
      //   'class': textid + ' emuwebapp-label-edit',
      //   'ng-model': 'message',
      //   'autofocus': 'true'
      // }).css(cssObj).text(label));
  }

  /**
   * Calculate values (x,y,width,height) for textarea to open
   * depending on the current Level type, the current canvas
   * and the current clicked Element
   *   @param lastEventClick the current clicked Level Element
   *   @param element the current html Element to get canvas from
   *   @param type the current Level type
   */
  private openEditArea (lastEventClick, element, type) {
      let levelName = this.view_state_service.getcurClickLevelName();
      let attrDefName = this.view_state_service.getCurAttrDef(levelName);

      // find labelIdx
      let labelIdx = LevelService.getLabelIdx(attrDefName, lastEventClick.labels);

      let elem = element.querySelectorAll('canvas')[0];
      let clientWidth = elem.clientWidth;
      let clientOffset = elem.offsetLeft;
      let top = elem.offsetTop;
      let height = elem.clientHeight - 1;
      let len = 10;
      let start, end, width;
      if (labelIdx !== undefined) {
          if (lastEventClick.labels[labelIdx].value.length > 0) {
              len = lastEventClick.labels[labelIdx].value.length * 7;
          }
      }
      let editText = '';
      if (lastEventClick.labels.length > 0) {
          if (lastEventClick.labels[labelIdx] !== undefined) {
              editText = lastEventClick.labels[labelIdx].value;
          }
          else {
              editText = '';
          }
      }
      if(!this.config_provider_service.vals.restrictions.useLargeTextInputField){
          if (type === 'SEGMENT') {
              start = Math.floor(this.view_state_service.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset);
              end = Math.ceil(this.view_state_service.getPos(clientWidth, (lastEventClick.sampleStart + lastEventClick.sampleDur + 1)) + clientOffset);
              this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);

              /*
                    zooming in disabled

                                if (width < (2 * len)) {
                                    let zoom = this.view_state_service.curViewPort.eS - this.view_state_service.curViewPort.sS;
                                    if (zoom <= 10) { // if already zoomed in but text is still too long
                                        this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);
                                    }
                                    else {
                                        this.view_state_service.zoomViewPort(true, this);
                                        this.openEditArea(lastEventClick, element, type);
                                        return;
                                    }
                                }
                */
          } else {
              start = this.view_state_service.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset - (len / 2);
              end = this.view_state_service.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset + (len / 2);
              width = end - start;
              if (width < (2 * len)) {
                  width = (2 * len);
              }
              this.createEditAreaElement(element, start, top, width, height, editText, lastEventClick.id);
          }
          this.createSelection(element.querySelectorAll('textarea')[0], 0, editText.length);
      }else{
          this.view_state_service.largeTextFieldInputFieldVisable = true;
          this.view_state_service.largeTextFieldInputFieldCurLabel =  editText;
      }
  };

  /**
   * Remove currently open html textarea (if there is a textarea open)
   * and set this.view_state_service.editing to false.
   */
  public deleteEditArea() {
      // if (null !== this.getlasteditArea()) {
      //   $('.' + this.getlasteditArea()).remove();
      // }

      /*
      @todo the viewState must be handled elsewhere
      this.view_state_service.editing = false;
      // close large text input field
      this.view_state_service.largeTextFieldInputFieldCurLabel =  '';
      this.view_state_service.largeTextFieldInputFieldVisable = false;
      */
  }

  /**
   * Create a Text Selection in a html Textarea
   *   @param field the textarea element
   *   @param start the starting character position as int
   *   @param end the ending character position as int
   */
  private createSelection (field, start, end) {
    if (field.createTextRange) {
        let selRange: {collapse, moveStart, moveEnd, select} = field.createTextRange();
        selRange.collapse(true);
        selRange.moveStart('character', start);
        selRange.moveEnd('character', end);
        selRange.select();
    } else if (field.setSelectionRange) {
        field.setSelectionRange(start, end);
    } else if (field.selectionStart) {
        field.selectionStart = start;
        field.selectionEnd = end;
    }
    field.focus();
  }
}
