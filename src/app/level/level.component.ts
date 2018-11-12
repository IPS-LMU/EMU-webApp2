import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {LevelService} from '../_services/level.service';
import {HistoryService} from '../_services/history.service';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';
import {getMousePositionInCanvasX, getSampleNumberAtCanvasMouseEvent} from '../_utilities/view-state-helper-functions';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';
import {drawLevelMarkup} from '../_utilities/drawing/draw-level-markup.function';
import {drawLevelDetails} from '../_utilities/drawing/draw-level-details.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';

@Component({
    selector: 'app-level',
    templateUrl: './level.component.html',
    styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {

    private _database_configuration: { restrictions: any, perspectives: any[] };
    private _preselected_item: PreselectedItemInfo;
    private _selected_items: IItem[];
    private _level_annotation: ILevel;
    private _attributeDefinition: string;
    private _viewport_sample_start: number;
    private _viewport_sample_end: number;
    private _selection_sample_start: number;
    private _selection_sample_end: number;
    private _moving_boundaries: Boundary[];
    private _crosshair_position: number;
    private _audio_buffer: AudioBuffer;
    private _selected: boolean;
    private _mouseover_level: ILevel;

    private initialised: boolean = false;

    @Input() set database_configuration(value: { restrictions: any, perspectives: any[] }) {
        // @todo make sure, database_configuration is loaded before the other @Inputs
        // apparently this can be controlled by the order of the @Input() setter methods - but I would not rely on this
        this._database_configuration = value;
    }

    @Input() set level_annotation(value: ILevel) {
        this._level_annotation = value;
    }

    @Input() set attributeDefinition(value: any) {
        this._attributeDefinition = value;
    }

    @Input() set viewport_sample_start(value: number) {
        this._viewport_sample_start = value;

        this.drawLevelMarkup();
        this.drawLevelDetails();
    }

    @Input() set viewport_sample_end(value: number) {
        this._viewport_sample_end = value;

        this.drawLevelMarkup();
        this.drawLevelDetails();
    }

    @Input() set selection_sample_start(value: number) {
        this._selection_sample_start = value;
        this.drawLevelMarkup();
    }

    @Input() set selection_sample_end(value: number) {
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

    @Input() set moving_boundaries(value: Boundary[]) {
        this._moving_boundaries = value;
        this.drawLevelMarkup();
    }

    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.drawLevelMarkup();
    }

    @Input() set audio_buffer(value: AudioBuffer) {
        this._audio_buffer = value;
    }

    @Input() set selected(value: boolean) {
        this._selected = value;
        this.drawLevelMarkup();
    }

    @Input() set mouseover_level(value: ILevel) {
        this._mouseover_level = value;
    }

    @Input() set label_editor_current_value(value: string) {
        this.drawLevelMarkup();
        this.drawLevelDetails();
    }

    @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
    @Output() moving_boundary_move: EventEmitter<Boundary[]> = new EventEmitter<Boundary[]>();

    @Output() preselect_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
    @Output() select_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();
    @Output() preselect_item: EventEmitter<PreselectedItemInfo> = new EventEmitter<PreselectedItemInfo>();
    @Output() select_items: EventEmitter<IItem[]> = new EventEmitter<IItem[]>();
    @Output() selection_change: EventEmitter<{ start: number, end: number }> = new EventEmitter<{ start: number, end: number }>();
    @Output() start_editing: EventEmitter<IItem> = new EventEmitter<IItem>();


    @ViewChild('levelCanvas') levelCanvas: ElementRef;
    @ViewChild('levelMarkupCanvas') levelMarkupCanvas: ElementRef;


    constructor(private history_service: HistoryService) {
    }

    ngOnInit() {
        this.initialised = true;
        this.drawLevelDetails();
        this.drawLevelMarkup();
    }


    public mouseclick(event: MouseEvent) {
        event.preventDefault();
        const clickedSample = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);
        this.handleClickAtSample(clickedSample, false);
    }

    public mousedblclick(event: MouseEvent) {
        event.preventDefault();
        const clickedSample = getSampleNumberAtCanvasMouseEvent(event, this._viewport_sample_start, this._viewport_sample_end);
        this.handleClickAtSample(clickedSample, true);
    }

    private handleClickAtSample(sample: number, startEditing: boolean) {
        this.select_level.emit(this._level_annotation);

        const itemNearCursor = LevelService.getClosestItem(sample, this._level_annotation, this._audio_buffer.length);

        if (itemNearCursor.current !== undefined && itemNearCursor.nearest !== undefined) {
            this.select_items.emit([itemNearCursor.current]);
            this.adjustSelectionToItems([itemNearCursor.current]);

            if (startEditing) {
                if (this._level_annotation.type === 'EVENT') {
                    if (itemNearCursor.current.samplePoint >= this._viewport_sample_start) {
                        if (itemNearCursor.current.samplePoint <= this._viewport_sample_end) {
                            this.start_editing.emit(itemNearCursor.current);
                        }
                    }
                } else {
                    if (itemNearCursor.current.sampleStart >= this._viewport_sample_start) {
                        if ((itemNearCursor.current.sampleStart + itemNearCursor.current.sampleDur) <= this._viewport_sample_end) {
                            this.start_editing.emit(itemNearCursor.current);
                        }
                    }
                }
            }
        } else {
            this.select_items.emit([]);
            this.adjustSelectionToItems([]);
        }
    }

    public mouserightclick(event: MouseEvent) {
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

    public mousemove(event: MouseEvent) {
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

        const moveBy = LevelService.calculateMoveDistance(
            event,
            this._preselected_item,
            this._viewport_sample_start,
            this._viewport_sample_end
        );
        const sampleNumberAtMousePosition = getSampleNumberAtCanvasMouseEvent(
            event,
            this._viewport_sample_start,
            this._viewport_sample_end
        );

        if (this._database_configuration.restrictions.editItemSize && event.shiftKey && this._preselected_item) {
            if (this._level_annotation.type === 'SEGMENT') {
                this.moveSegmentBoundary(this._preselected_item.item, moveBy);
            } else {
                this.moveEvent(this._preselected_item.item, moveBy);
            }

            this.refreshPreselectedItem();
            this.drawLevelDetails();
        } else if (this._database_configuration.restrictions.editItemSize && event.altKey && this._selected_items.length > 0) {
            if (this._level_annotation.type === 'SEGMENT') {
                this.moveSegments(this._selected_items, moveBy);
            } else if (this._level_annotation.type === 'EVENT') {
                this.moveEvents(this._selected_items, moveBy);
            }

            this.refreshPreselectedItem();
            this.drawLevelDetails();
        } else {
            this.moving_boundary_move.emit([]);
            this.crosshair_move.emit(getMousePositionInCanvasX(event));

            const itemNearCursor = LevelService.getClosestItem(
                sampleNumberAtMousePosition,
                this._level_annotation,
                this._audio_buffer.length
            );
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
                    neighbours: LevelService.getItemNeighboursFromLevel(
                        this._level_annotation,
                        itemNearCursor.nearest.id,
                        itemNearCursor.nearest.id
                    ),
                    isFirst: itemNearCursor.isFirst,
                    isLast: itemNearCursor.isLast,
                    selectedBoundary: selectedBoundary
                });
            }
        }
    }

    private refreshPreselectedItem() {
        let selectedBoundaryPosition: number;

        if (this._level_annotation.type === 'EVENT') {
            selectedBoundaryPosition = this._preselected_item.item.samplePoint;
        } else {
            if (this._preselected_item.isLast) {
                selectedBoundaryPosition = this._preselected_item.item.sampleStart + this._preselected_item.item.sampleDur;
            } else {
                selectedBoundaryPosition = this._preselected_item.item.sampleStart;
            }
        }

        this.preselect_item.emit({
            item: this._preselected_item.item,
            neighbours: this._preselected_item.neighbours,
            isFirst: this._preselected_item.isFirst,
            isLast: this._preselected_item.isLast,
            selectedBoundary: {
                sample: selectedBoundaryPosition,
                positionInSample: this._preselected_item.selectedBoundary.positionInSample
            }
        });
    }

    private moveSegments(segments: IItem[], moveBy: number) {
        if (segments.length === 0) {
            return;
        }

        LevelService.moveSegment(this._level_annotation, segments[0].id, segments.length, moveBy, this._audio_buffer.length);

        const movingBoundaries: Boundary[] = [];

        for (const segment of segments) {
            movingBoundaries.push({
                sample: segment.sampleStart,
                positionInSample: 'start'
            });
        }

        movingBoundaries.push({
            sample: segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur,
            positionInSample: 'end'
        });

        this.moving_boundary_move.emit(movingBoundaries);

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
        if (events.length === 0) {
            return;
        }

        const movingBoundaries: Boundary[] = [];

        for (const event of events) {
            movingBoundaries.push({
                sample: event.samplePoint,
                positionInSample: 'center'
            });
        }

        this.moving_boundary_move.emit(movingBoundaries);

        for (const event of events) {
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

    private moveSegmentBoundary(segment: IItem, moveBy: number) {
        LevelService.moveBoundary(
            this._level_annotation,
            segment.id,
            moveBy,
            this._preselected_item.isFirst,
            this._preselected_item.isLast,
            this._audio_buffer.length
        );

        this.moving_boundary_move.emit([{
            sample: this._preselected_item.selectedBoundary.sample + moveBy,
            positionInSample: this._preselected_item.selectedBoundary.positionInSample
        }]);

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

    private moveEvent(event: IItem, moveBy: number) {
        this.moving_boundary_move.emit([{
            sample: event.samplePoint + moveBy,
            positionInSample: 'center'
        }]);

        LevelService.moveEvent(this._level_annotation, event.id, moveBy, this._audio_buffer.length);

        this.history_service.updateCurChangeObj({
            'type': 'ANNOT',
            'action': 'MOVEEVENT',
            'name': this._level_annotation.name,
            'id': event.id,
            'movedBy': moveBy
        });
    }

    private addToSelection(item: IItem) {
        if (this._selected_items.includes(item)) {
            return;
        }

        const leftNeighbour = LevelService.getItemInTime(this._level_annotation, item.id, false);
        const rightNeighbour = LevelService.getItemInTime(this._level_annotation, item.id, true);

        if (this._selected_items.includes(leftNeighbour) || this._selected_items.includes(rightNeighbour)) {
            const items = [...this._selected_items, item];
            items.sort(LevelService.sortItemsByStart);
            this.select_items.emit(items);
            this.adjustSelectionToItems(items);
        }
    }

    private adjustSelectionToItems(items: IItem[]) {
        if (this._level_annotation.type === 'EVENT') {
            this.selection_change.emit({
                start: items[0].samplePoint,
                end: items[items.length - 1].samplePoint,
            });
        } else {
            this.selection_change.emit({
                start: items[0].sampleStart,
                end: items[items.length - 1].sampleStart + items[items.length - 1].sampleDur + 1
            });
        }
    }

    private drawLevelDetails() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }
        const context = this.levelCanvas.nativeElement.getContext('2d');
        drawLevelDetails(
            context,
            this._level_annotation,
            this._attributeDefinition,
            this._viewport_sample_start,
            this._viewport_sample_end,
            false,
            emuWebappTheme
        );
    }

    private drawLevelMarkup() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

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
            this._moving_boundaries,
            this._audio_buffer,
            this._mouseover_level,
            emuWebappTheme
        );
    }
}
