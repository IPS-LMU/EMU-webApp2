import {Component, Input, ViewChild, ElementRef, EventEmitter, Output} from '@angular/core';
import { LevelService } from '../_services/level.service';
import { HistoryService } from '../_services/history.service';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';
import {getMousePositionInCanvasX, getSampleNumberAtCanvasMouseEvent} from '../_utilities/view-state-helper-functions';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';
import {drawLevelMarkup} from '../_utilities/drawing/draw-level-markup.function';
import {drawLevelDetails} from '../_utilities/drawing/draw-level-details.function';
import {Boundary} from '../_interfaces/boundary.interface';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent {

  private _database_configuration: {restrictions: any, perspectives: any[]};
  private _preselected_item: PreselectedItemInfo;
  private _selected_items: IItem[];
  private _level_annotation: ILevel;
  private _attributeDefinition: string;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _selection_sample_start: number;
  private _selection_sample_end: number;
  private _moving_boundary: Boundary;
  private _crosshair_position: number;
  private _audio_buffer: AudioBuffer;
  private _selected: boolean;
  private _mouseover_level: ILevel;

  @Input() set database_configuration(value: {restrictions: any, perspectives: any[]}) {
    // @todo make sure, database_configuration is loaded before the other @Inputs
    // apparently this can be controlled by the order of the @Input() setter methods - but I would not rely on this
    this._database_configuration = value;
  }
  @Input() set level_annotation(value: ILevel){
    this._level_annotation = value;
  }
  @Input() set attributeDefinition(value: any){
    this._attributeDefinition = value;
  }
  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;

    this.drawLevelMarkup();
    this.drawLevelDetails();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;

    this.drawLevelMarkup();
    this.drawLevelDetails();
  }
  @Input() set selection_sample_start(value: number){
      this._selection_sample_start = value;
      this.drawLevelMarkup();
  }
  @Input() set selection_sample_end(value: number){
      this._selection_sample_end = value;
      this.drawLevelMarkup();
  }
  @Input() set preselected_item(value: PreselectedItemInfo) {
    this._preselected_item = value;
    this.drawLevelMarkup();
  }
  @Input() set selected_items(value: IItem[]) {
    this._selected_items = value;
    this.drawLevelMarkup();
  }
  @Input() set moving_boundary(value: Boundary) {
    this._moving_boundary = value;
    this.drawLevelMarkup();
  }
  @Input() set crosshair_position(value: number) {
    this._crosshair_position = value;
    this.drawLevelMarkup();
  }
  @Input() set audio_buffer(value: AudioBuffer){
    this._audio_buffer = value;
  }
  @Input() set selected(value: boolean) {
    this._selected = value;
    this.drawLevelMarkup();
  }
  @Input() set mouseover_level(value: ILevel) {
    this._mouseover_level = value;
  }

  @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
  @Output() moving_boundary_move: EventEmitter<Boundary> = new EventEmitter<Boundary>();

  @Output() preselect_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
  @Output() select_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
  @Output() preselect_item: EventEmitter<PreselectedItemInfo> = new EventEmitter<PreselectedItemInfo>();
  @Output() select_items: EventEmitter<IItem[]> = new EventEmitter<IItem[]>();


  @ViewChild('levelCanvas') levelCanvas: ElementRef;
  @ViewChild('levelMarkupCanvas') levelMarkupCanvas: ElementRef;


  constructor(private history_service: HistoryService) { }


  public mouseclick(event: MouseEvent){
    event.preventDefault();

    this.select_level.emit(this._level_annotation);

    const clickedSample = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);

    const itemNearCursor = LevelService.getClosestItem(clickedSample, this._level_annotation, this._audio_buffer.length);
    if (itemNearCursor.current !== undefined && itemNearCursor.nearest !== undefined) {
        this.select_items.emit([itemNearCursor.current]);
    } else {
      this.select_items.emit([]);
    }
  }

  public mousedblclick(event: MouseEvent){
    if (this._database_configuration.restrictions.editItemName) {
      /*
        const clickedSample = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);
        const itemNearCursor = LevelService.getClosestItem(clickedSample, this._level_annotation, this._audio_buffer.length);
        // let isOpen = this.element_ref.nativeElement.parentElement.css('height') === '25px' ? false : true;
        // expand to full size on dbl click if level is in small size
        // if (!isOpen) {
        //   this.element_ref.nativeElement.parentElement.find('div')[3].click();
        // }
        if (itemNearCursor.current !== undefined && itemNearCursor.nearest !== undefined && this.view_state_service.getPermission('labelAction')) {
            if (this._level_annotation.type === 'SEGMENT') {
                if (itemNearCursor.current.sampleStart >= this._viewport_sample_start) {
                    if ((itemNearCursor.current.sampleStart + itemNearCursor.current.sampleDur) <= this._viewport_sample_end) {
                        this.select_level.emit();
                        this.select_items.emit([itemNearCursor.current]);
                    } else {
                        //console.log('Editing out of right bound !');
                    }
                } else {
                    //console.log('Editing out of left bound !');
                }
            } else {
                this.select_level.emit();
                this.select_items.emit([itemNearCursor.current]);
            }
        }
        */
    }
  }

  public mouserightclick(event: MouseEvent){
      event.preventDefault();

      if (!this._selected) {
          this.select_level.emit(this._level_annotation);
          this.select_items.emit([]);
      }

      const clickedSample = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);

      const itemNearCursor = LevelService.getClosestItem(clickedSample, this._level_annotation, this._audio_buffer.length);
      if (itemNearCursor.current !== undefined && itemNearCursor.nearest !== undefined) {
          this.addToSelection(itemNearCursor.current);
      }
  }

  public mouseenter(event: MouseEvent) {
    this.preselect_level.emit(this._level_annotation);
  }

  public mouseleave(event: MouseEvent) {
    this.preselect_item.emit(null);
    this.preselect_level.emit(null);
  }

  public mousemove(event: MouseEvent){
      // if (!this.view_state_service.focusOnEmuWebApp) {
      //  return;
      // }

      let mouseButton = 0;
      if (event.buttons === undefined) {
          mouseButton = event.which;
      } else {
          mouseButton = event.buttons;
      }
      if (mouseButton === 1 || mouseButton === 2 || mouseButton === 3) {
          // 1: left button pressed; 2: middle button pressed; 3: right button pressed
          return;
      }

      const moveBy = LevelService.calculateMoveDistance(event, this._preselected_item, this._viewport_sample_start, this._viewport_sample_end);
      const sampleNumberAtMousePosition = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);

      if (this._database_configuration.restrictions.editItemSize && event.shiftKey && this._preselected_item) {
          if (this._level_annotation.type === 'SEGMENT') {
              this.moveSegmentBoundary(this._preselected_item.item, moveBy);
          } else {
              this.moveEvent(this._preselected_item.item, moveBy);
          }

          this.drawLevelDetails();
      } else if (this._database_configuration.restrictions.editItemSize && event.altKey && this._selected_items.length > 0) {
          if (this._level_annotation.type === 'SEGMENT') {
              this.moveSegments(this._selected_items, moveBy);
          }
          else if (this._level_annotation.type === 'EVENT') {
              this.moveEvents(this._selected_items, moveBy);
          }

          this.drawLevelDetails();
      } else {
          this.moving_boundary_move.emit(null);
          this.crosshair_move.emit(getMousePositionInCanvasX(event));

          const itemNearCursor = LevelService.getClosestItem(sampleNumberAtMousePosition, this._level_annotation, this._audio_buffer.length);
          if (itemNearCursor.current && itemNearCursor.nearest) {
              let selectedBoundary: Boundary;

              if (this._level_annotation.type === 'EVENT') {
                  selectedBoundary = {
                      sample: itemNearCursor.nearest.samplePoint,
                      positionInSample: 'center'
                  };
              } else {
                  if (itemNearCursor.isLast) {
                      selectedBoundary = {
                          sample: itemNearCursor.nearest.sampleStart + itemNearCursor.nearest.sampleDur,
                          positionInSample: 'end'
                      };
                  } else {
                      selectedBoundary = {
                          sample: itemNearCursor.nearest.sampleStart,
                          positionInSample: 'start'
                      };
                  }
              }

              this.preselect_item.emit({
                  item: itemNearCursor.nearest,
                  neighbours: LevelService.getItemNeighboursFromLevel(this._level_annotation, itemNearCursor.nearest.id, itemNearCursor.nearest.id),
                  isFirst: itemNearCursor.isFirst,
                  isLast: itemNearCursor.isLast,
                  selectedBoundary: selectedBoundary
              });
          }
      }
  }

  private moveSegments(segments: IItem[], moveBy: number) {
      LevelService.moveSegment(this._level_annotation, segments[0].id, segments.length, moveBy, this._audio_buffer.length);

      this.history_service.updateCurChangeObj({
          'type': 'ANNOT',
          'action': 'MOVESEGMENT',
          'name': this._level_annotation.name,
          'id': segments[0].id,
          'length': segments.length,
          'movedBy': moveBy
      });
  }

  private moveEvents(events: IItem[], moveBy: number) {
      for (let event of events) {
          LevelService.moveEvent(this._level_annotation, event.id, moveBy, this._audio_buffer.length);

          this.history_service.updateCurChangeObj({
              'type': 'ANNOT',
              'action': 'MOVEEVENT',
              'name': this._level_annotation.name,
              'id': event.id,
              'movedBy': moveBy
          });
      }
  }

  private moveSegmentBoundary (segment: IItem, moveBy: number) {
      if (this._preselected_item.isLast) {
          this.moving_boundary_move.emit({
              sample: segment.sampleStart + segment.sampleDur + moveBy,
              positionInSample: 'end'
          });
      } else {
          this.moving_boundary_move.emit({
              sample: segment.sampleStart + moveBy,
              positionInSample: 'start'
          });
      }

      LevelService.moveBoundary(
          this._level_annotation,
          segment.id,
          moveBy,
          this._preselected_item.isFirst,
          this._preselected_item.isLast,
          this._audio_buffer.length
      );

      this.history_service.updateCurChangeObj({
          'type': 'ANNOT',
          'action': 'MOVEBOUNDARY',
          'name': this._level_annotation.name,
          'id': segment.id,
          'movedBy': moveBy,
          'isFirst': this._preselected_item.isFirst,
          'isLast': this._preselected_item.isLast
      });
  }

  private moveEvent (event: IItem, moveBy: number) {
      this.moving_boundary_move.emit({
          sample: event.samplePoint + moveBy,
          positionInSample: 'center'
      });

      LevelService.moveEvent(this._level_annotation, event.id, moveBy, this._audio_buffer.length);

      this.history_service.updateCurChangeObj({
          'type': 'ANNOT',
          'action': 'MOVEEVENT',
          'name': this._level_annotation.name,
          'id': event.id,
          'movedBy': moveBy
      });
  }

  private addToSelection (item: IItem) {
      if (this._selected_items.includes(item)) {
        return;
      }

      const leftNeighbour = LevelService.getItemInTime(this._level_annotation, item.id, false);
      const rightNeighbour = LevelService.getItemInTime(this._level_annotation, item.id, true);

      if (this._selected_items.includes(leftNeighbour) || this._selected_items.includes(rightNeighbour)) {
          const items = [...this._selected_items, item];
          items.sort(LevelService.sortItemsByStart);
          this.select_items.emit(items);
      }
  }

  private drawLevelDetails() {
      const context = this.levelCanvas.nativeElement.getContext('2d');
      drawLevelDetails(
          context,
          this._level_annotation,
          this._attributeDefinition,
          this._viewport_sample_start,
          this._viewport_sample_end,
          false
      );
  }

  private drawLevelMarkup() {
      const context = this.levelMarkupCanvas.nativeElement.getContext('2d');
      drawLevelMarkup(
          context,
          this._level_annotation,
          this._viewport_sample_start,
          this._viewport_sample_end,
          this._selection_sample_start,
          this._selection_sample_end,
          this._selected,
          this._selected_items,
          this._preselected_item,
          this._crosshair_position,
          this._moving_boundary,
          this._audio_buffer,
          this._mouseover_level
      );
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
//     //let mTxtImgWidth = ctx.measureText('m').width * FontScaleService.scaleX;
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
//         let posS = Math.round(getPixelPositionOfSampleInViewport(
//            curLevel.items[itemIdx]._derivedSampleStart,
//            this._viewport_sample_start,
//            this._viewport_sample_end,
//            ctx.canvas.width
//         ));
//         let posE = Math.round(getPixelPositionOfSampleInViewport(
//            curLevel.items[itemIdx]._derivedSampleEnd,
//            this._viewport_sample_start,
//            this._viewport_sample_end,
//            ctx.canvas.width
//         ))
//         ctx.strokeRect(posS, curStartY , posE - posS, curStartY + levelHeight);
//
//         // draw label
//         FontScaleService.drawUndistortedText(ctx, curLevel.items[itemIdx].labels[0].value, fontSize - 2, this.config_provider_service.design.font.small.family, posS + (posE - posS) / 2 - ctx.measureText(curLevel.items[itemIdx].labels[0].value).width / 2 - 2, curStartY + levelHeight / 2, this.config_provider_service.design.color.black, true);
//       }
//     }
//
//   };
//
// }
// };


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

  /**
   * Create a Text Selection in a html Textarea
   *   @param field the textarea element
   *   @param start the starting character position as int
   *   @param end the ending character position as int
   */
  /*
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
  */
}
