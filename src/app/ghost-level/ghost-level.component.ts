import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  AfterViewInit} from '@angular/core';
import { Observable, of } from 'rxjs';

declare const Konva: any;

// import Konva from 'Konva';

import { HistoryService } from '../_services/history.service';
import { IItem, IAnnotJSON, ILevel } from '../_interfaces/annot-json.interface';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';
// import {drawLevelMarkup} from '../_utilities/drawing/draw-level-markup.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {ghostLevelWorker} from '../_workers/ghostlevel-worker.function';
import {getCanvasCoordinateOfSample} from '../_utilities/coordinate-system.functions';
import {LevelService} from '../_services/level.service';

@Component({
  selector: 'app-ghost-level',
  templateUrl: './ghost-level.component.html',
  styleUrls: ['./ghost-level.component.scss']
})
export class GhostLevelComponent implements OnInit, AfterViewInit {

  // private vars
  private _database_configuration: {restrictions: any, perspectives: any[]};
  private _preselected_item: PreselectedItemInfo;
  private _selected_items: IItem[];
  private _annotation: IAnnotJSON;
  private _attributeDefinition: string;
  private _viewport_sample_start: number;
  private _viewport_sample_end: number;
  private _selection_sample_start: number;
  private _selection_sample_end: number;
  private _moving_boundaries: Boundary[];
  private _crosshair_position: number;
  // private _audio_buffer: AudioBuffer;
  private _selected: boolean;
  // private _mouseover_level: ILevel;

  private initialised: boolean = false;

  private _worker;
  private _workerFunctionURL;

  private _linkMap: Map<number, Array<number>>;
  private _idItemMap: Map<number, IItem>;

  // public vars
  public stage: any;
  public hierarchy_layer: any;
  public timelines_layer: any;


  @Input() set database_configuration(value: {restrictions: any, perspectives: any[]}) {
    // @todo make sure, database_configuration is loaded before the other @Inputs
    // apparently this can be controlled by the order of the @Input() setter methods - but I would not rely on this
    this._database_configuration = value;
  }
  @Input() set annotation(value: IAnnotJSON){
    this._annotation = value;
  }
  @Input() set attributeDefinition(value: any){
    this._attributeDefinition = value;
  }
  @Input() set viewport_sample_start(value: number){
    this._viewport_sample_start = value;

    // this.drawLevelMarkup();
    this.drawHierarchyDetails();
  }
  @Input() set viewport_sample_end(value: number){
    this._viewport_sample_end = value;

    // this.drawLevelMarkup();
    this.drawHierarchyDetails();
  }
  @Input() set selection_sample_start(value: number){
    this._selection_sample_start = value;
    // this.drawLevelMarkup();
  }
  @Input() set selection_sample_end(value: number){
    this._selection_sample_end = value;
    // this.drawLevelMarkup();
  }
  @Input() set preselected_item(value: PreselectedItemInfo) {
    this._preselected_item = value;
    // this.drawLevelMarkup();
  }
  @Input() set selected_items(value: IItem[]) {
    this._selected_items = value;
    // this.drawLevelMarkup();
  }
  @Input() set moving_boundaries(value: Boundary[]) {
    this._moving_boundaries = value;
    // this.drawLevelMarkup();
  }
  @Input() set crosshair_position(value: number) {
    this._crosshair_position = value;
    // this.drawLevelMarkup();
  }
  // @Input() set audio_buffer(value: AudioBuffer){
  //   this._audio_buffer = value;
  // }
  @Input() set selected(value: boolean) {
    this._selected = value;
    // this.drawLevelMarkup();
  }
  @Input() set mouseover_level(value: ILevel) {
    // this._mouseover_level = value;
  }

  @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
  @Output() moving_boundary_move: EventEmitter<number> = new EventEmitter<number>();

  @Output() preselect_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
  @Output() select_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
  @Output() preselect_item: EventEmitter<PreselectedItemInfo> = new EventEmitter<PreselectedItemInfo>();
  @Output() select_items: EventEmitter<IItem[]> = new EventEmitter<IItem[]>();


  @ViewChild('levelcontainer') levelcontainer: ElementRef;

  constructor(private history_service: HistoryService) {

    const workerFunctionBlob = new Blob(['(' + ghostLevelWorker.toString() + ')();'], {type: 'text/javascript'});
    this._workerFunctionURL = window.URL.createObjectURL(workerFunctionBlob);
    this._worker = new Worker(this._workerFunctionURL);

  }

  ngOnInit() {
  }



  ngAfterViewInit() {

    this.initialised = true;

    this.drawHierarchyDetails();

  }

  /**
   * draw level hierarchy
   */
  private drawHierarchyDetails() {
    // don't do anything if not inited
    if (!this.initialised) {
      return;
    }

    if (!this.stage) {
      this.stage = new Konva.Stage({
        container: 'container',
        width: this.levelcontainer.nativeElement.clientWidth,
        height: this.levelcontainer.nativeElement.clientHeight
      });

      this.hierarchy_layer = new Konva.Layer();
      this.timelines_layer = new Konva.Layer();

      this.timelines_layer.alpha(0.1); // SIC not working
      // this.timelines_layer.disableHitGraph();

      this.stage.add(this.hierarchy_layer);
      this.stage.add(this.timelines_layer);

    }

    // use hard coded path for now
    const path = [
      'Utterance',
      'Intonational',
      'Intermediate',
      'Word',
      'Syllable',
      'Phoneme',
      'Phonetic'
    ].reverse();

    this.hierarchy_layer.destroyChildren();
    this.timelines_layer.destroyChildren();

    /////////////////////////////////
    // build hashmaps for faster access
    // (should probably do this in worker and when needed)
    // make level hashmap
    const levelNameLevelMap = new Map();
    this._annotation.levels.forEach((level) => {
      levelNameLevelMap.set(level.name, level);
    });

    // build id -> item hashmap
    this._idItemMap = new Map();
    path.forEach((levelName) => {
      const level = levelNameLevelMap.get(levelName);
      level.items.forEach((item) => {
        this._idItemMap.set(item.id, item);
      });
    });

    // build link hashmap (bottom -> up; toID -> fromID)
    this._linkMap = new Map();
    this._annotation.links.forEach((link) => {
      if (this._linkMap.get(link.toID)){
        this._linkMap.set(link.toID, this._linkMap.get(link.toID).concat(link.fromID));
      } else {
        this._linkMap.set(link.toID, [link.fromID]);
      }
    });

    // calc times for non-time levels
    path.forEach((levelName, levelNameIdx) => {
      // don't look for parent when reached top of path
      if (levelNameIdx === path.length - 1) {return;}
      const level = levelNameLevelMap.get(levelName);
      const parentLevelName = path[levelNameIdx + 1];

      level.items.forEach((item) => {
        // add render values to bottom level item (what about timeless paths?)
        if (levelNameIdx === 0) {
          item.renderHierVals = {
            sampleStart: item.sampleStart,
            sampleEnd: item.sampleStart + item.sampleDur
          };
        }
        const parentIds = this._linkMap.get(item.id);
        if (parentIds) {
          parentIds.forEach((parentId) => {
            const parent = this._idItemMap.get(parentId);
            if (parent) {
              // check if parent in correct level
              if (parent.labels[0].name === parentLevelName) {
                // add new renderHierVals attributes if they don't exist
                if (!parent.renderHierVals) {
                  parent.renderHierVals = {
                    sampleStart: item.renderHierVals.sampleStart,
                    sampleEnd: item.renderHierVals.sampleEnd
                  };
                } else {
                  // update if they do
                  if (item.renderHierVals.sampleStart <= parent.renderHierVals.sampleStart) {
                    parent.renderHierVals.sampleStart = item.renderHierVals.sampleStart;
                  }
                  if (item.renderHierVals.sampleEnd >= parent.renderHierVals.sampleEnd) {
                    parent.renderHierVals.sampleEnd = item.renderHierVals.sampleEnd;
                  }
                }
                // TODO: timeless items?
              }
            } else {
              console.log("no parent found?");
            }
          });
        }
      });
    });

    let levelHeight = this.stage.getStage().getHeight() / path.length;
    let levelYmin = 0;
    let levelYmax = levelHeight;

    path.forEach((levelName, levelNameIdx) => {
      const level = levelNameLevelMap.get(levelName);
      const attribute = level.name; // SIC hardcoded!
      // draw level name
      const stageHeight = this.stage.getStage().getHeight();
      const levelLabel = new Konva.Text({
        x: 0,
        y: (stageHeight - levelYmin) - (levelYmax - levelYmin) / 2,
        text: levelName + ':' + attribute,
        fontSize: emuWebappTheme.primaryFontSize - 4,
        fontFamily: emuWebappTheme.primaryFontFamily,
        fill: emuWebappTheme.primaryLineColor
        // align: 'right'
        // verticalAlign: 'right'
      });
      this.hierarchy_layer.add(levelLabel);

      for (const item of level.items) {
        if (item.renderHierVals.sampleStart >= this._viewport_sample_start &&
          item.renderHierVals.sampleStart <= this._viewport_sample_end || // within segment
          item.renderHierVals.sampleEnd > this._viewport_sample_start &&
          item.renderHierVals.sampleEnd < this._viewport_sample_end || // end in segment
          item.renderHierVals.sampleStart < this._viewport_sample_start &&
          item.renderHierVals.sampleEnd > this._viewport_sample_end // within sample
        ) {
          this.drawSegment(
            item,
            attribute,
            levelYmin,
            levelYmax
          );

        }
      }

      levelYmin += levelHeight;
      levelYmax += levelHeight;

    });

    // draw layers
    this.hierarchy_layer.draw();

    this.timelines_layer.cache();
    this.timelines_layer.filters([Konva.Filters.Blur]);
    this.timelines_layer.blurRadius(5);

    this.timelines_layer.draw();

  }

  /**
   *
   *
   * */
  private drawSegment(item: IItem,
                      attribute: string,
                      levelYmin: number,
                      levelYmax: number) {

    const labelValue = LevelService.getLabelByAttribute(item, attribute);

    let stageWidth = this.stage.getStage().getWidth();
    let stageHeight = this.stage.getStage().getHeight();
    // draw segment start
    const posS = getCanvasCoordinateOfSample(
      item.renderHierVals.sampleStart,
      this._viewport_sample_start,
      this._viewport_sample_end,
      stageWidth
    ).start;
    const posE = getCanvasCoordinateOfSample(
      item.renderHierVals.sampleEnd,
      this._viewport_sample_start,
      this._viewport_sample_end,
      stageWidth
    ).end;

    const startLine = new Konva.Line({
      points: [
        posS,
        stageHeight - levelYmin - (levelYmax - levelYmin) / 2,
        posS,
        stageHeight - levelYmax,
        posS,
        stageHeight - levelYmax + (levelYmax - levelYmin) / 4,
        posS + (posE - posS) / 2,
        stageHeight - levelYmax + (levelYmax - levelYmin) / 4,
        posS + (posE - posS) / 2,
        stageHeight - levelYmax + (levelYmax - levelYmin) / 4 + 1,
      ],
      stroke: emuWebappTheme.primaryLineColor,
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round'
    });

    const label = new Konva.Text({
      text: item.labels[0].value, // SIC hard coded
      x: posS, //+ ((posE - posS) / 2),
      y: (stageHeight - levelYmin) - (levelYmax - levelYmin),// / 2,
      width: (posE - posS), // as wide as segment
      height: (levelYmax - levelYmin), // as high as level
      fontSize: emuWebappTheme.primaryFontSize - 2,
      fontFamily: emuWebappTheme.primaryFontFamily,
      fill: emuWebappTheme.primaryLineColor,
      align: 'center',
      verticalAlign: 'middle'
    });

    const endLine = new Konva.Line({
      points: [
        posE,
        stageHeight - levelYmin - (levelYmax - levelYmin) / 2,
        posE,
        stageHeight - levelYmin,
        posE,
        stageHeight - levelYmin - (levelYmax - levelYmin) / 4,
        posE - (posE - posS) / 2,
        stageHeight - levelYmin - (levelYmax - levelYmin) / 4,
        posE - (posE - posS) / 2,
        stageHeight - levelYmin - (levelYmax - levelYmin) / 4 - 1
      ],
      stroke: emuWebappTheme.secondaryFontColor,
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round'
    });


    this.timelines_layer.add(startLine);
    this.hierarchy_layer.add(label);
    this.timelines_layer.add(endLine);

    this.timelines_layer.alpha(0.1);

    // draw child -> parent lines
    const parentIds = this._linkMap.get(item.id);
    if (parentIds) {
      parentIds.forEach((parentId) => {
        const parent = this._idItemMap.get(parentId);
        if (parent) {
          const pos_parent = getCanvasCoordinateOfSample(
            parent.renderHierVals.sampleStart + (parent.renderHierVals.sampleEnd - parent.renderHierVals.sampleStart) / 2,
            this._viewport_sample_start,
            this._viewport_sample_end,
            stageWidth
          ).start;

          const childParentLine = new Konva.Line({
            points: [
              posS + ((posE - posS) / 2),
              stageHeight - levelYmin - (levelYmax - levelYmin) / 2,
              pos_parent,
              stageHeight - levelYmax - (levelYmax - levelYmin) / 2
            ],
            stroke: emuWebappTheme.primaryFontColor,
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
          });

          childParentLine.on('mouseover', function() {
            console.log("sdjkfladsjfklajsdfkl");
          });

          this.hierarchy_layer.add(childParentLine);

        }
      });
    }

  }

}
