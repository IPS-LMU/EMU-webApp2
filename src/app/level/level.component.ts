import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LevelService} from '../_services/level.service';
import {HistoryService} from '../_services/history.service';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';
import {getMousePositionInCanvasX, getSampleNumberAtCanvasMouseEvent} from '../_utilities/coordinate-system.functions';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';
import {drawLevelMarkup} from '../_utilities/drawing/draw-level-markup.function';
import {drawLevelDetails} from '../_utilities/drawing/draw-level-details.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {CanvasBase} from '../canvas-base.class';

@Component({
    selector: 'app-level',
    templateUrl: './level.component.html',
    styleUrls: ['./level.component.scss']
})
export class LevelComponent extends CanvasBase {
    private _database_configuration: { restrictions: {editItemSize: boolean} };
    private _preselected_item: PreselectedItemInfo;
    private _selected_items: IItem[];
    private _level_annotation: ILevel;
    private _attribute_name: string;
    private _selected: boolean;
    private _move_with_mouse: boolean;


    /**
     * In emuDB format, media files are part of a database and that database has
     * a configuration object.
     *
     * This component currently requires only one property of that configuration object.
     */
    @Input() set database_configuration(value: { restrictions: {editItemSize: boolean} }) {
        this._database_configuration = value;
        this.redraw();
    }

    /**
     * This is the data structure displayed in the component, in emuDB format.
     *
     * Since this is the LevelComponent, we expect exactly one level, which is a
     * part of the annotation data structure that describes one media file.
     */
    @Input() set level_annotation(value: ILevel) {
        this._level_annotation = value;
        this.redraw();
    }

    /**
     * In the emuDB format, each level has a number (>= 1) of attributes. Each
     * item on a level must have exactly one label for every attribute the level
     * has.
     *
     * The LevelComponent will only render the labels of the one attribute
     * specified here.
     */
    @Input() set attribute_name(value: string) {
        this._attribute_name = value;
        this.redraw();
    }

    /**
     * Preselection happens as the user hovers over the component.
     *
     * Note that this component also has the @Output preselect_item, where it
     * emits a new item whenever the user moves the mouse cursor. It is usually
     * best to initialize this @Input to null and then update it according to
     * what preselect_item emits.
     *
     * The terminology here is somewhat inconsistent. We talk about "preselected
     * items", but this is really true only when hovering over an event-typed
     * level. In that case, the event closest to the mouse cursor is preselected.
     * In the case of hovering over a segment-typed level, the segment boundary
     * closest to the cursor is preselected.
     *
     * Many user actions, such as "delete item" or "move boundary", are carried
     * out on the preselected thing.
     *
     * The data structure used here (PreselectedItemInfo) is a mixture of things
     * that have already been refactored and things that have not.
     */
    @Input() set preselected_item(value: PreselectedItemInfo) {
        this._preselected_item = value;
        this.drawMarkup();
    }

    /**
     * Selection happens as the user clicks on a segment or event.
     *
     * Note that this component also has the @Output select_items, where it
     * emits a new IItem array whenever the user clicks on the level. It is
     * usually best to initialize this @Input to an empty array and then update
     * it according to what select_items emits.
     *
     * Some user actions, such as "move item", can be carried out on all
     * selected items at the same time.
     */
    @Input() set selected_items(value: IItem[]) {
        this._selected_items = value;
        this.drawMarkup();
    }

    /**
     * Marks whether the level itself is selected (among multiple levels
     * displayed at the same time).
     *
     * Note that this component also has the @Output select_level, which can be
     * indirectly linked to this @Input. The @Output emits the data structure
     * representing the level in this component whenever the user clicks inside
     * the level. This @Input, however, needs a boolean value.
     */
    @Input() set selected(value: boolean) {
        this._selected = value;
        this.drawMarkup();
    }

    /**
     * Unfinished feature. We are going to have the user edit labels somewhere
     * outside of this component, but we want to display what they are typing
     * in this component as well. The external editor should provide the current
     * value here while the user is typing.
     * @param value
     */
    @Input() set label_editor_current_value(value: string) {
        this.redraw();
    }

    @Input() set move_with_mouse(value: boolean) {
        this._move_with_mouse = value;
    }

    /**
     * The "moving boundary" is a segment boundary or event that the user is
     * currently moving.
     *
     * This @Output exists to notify other components (such as the OsciComponent)
     * so that they can visualize ongoing changes.
     */
    @Output() moving_boundary_move: EventEmitter<Boundary[]> = new EventEmitter<Boundary[]>();

    /**
     * Emits the data structure representing the current level whenever the user
     * clicks inside this level.
     *
     * See also @Input select_level.
     */
    @Output() select_level: EventEmitter<ILevel> = new EventEmitter<ILevel>();

    /**
     * Emits a data structure describing the preselection while the user is
     * hovering over this level.
     *
     * See also @Input preselected_item.
     */
    @Output() preselect_item: EventEmitter<PreselectedItemInfo> = new EventEmitter<PreselectedItemInfo>();

    /**
     * Emits an array of items whenever the user clicks on an item in this level.
     *
     * See also @Input selected_items.
     */
    @Output() select_items: EventEmitter<IItem[]> = new EventEmitter<IItem[]>();

    /**
     * Unfinished feature. See also @Input label_editor_current_value.
     */
    @Output() start_editing: EventEmitter<IItem> = new EventEmitter<IItem>();

    constructor(private history_service: HistoryService) {
        super();
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

    public mouseleave(event: MouseEvent) {
        this.preselect_item.emit(null);
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

	const doNormalMove = false;

	if (this._move_with_mouse) {
		if (mouseButton === 1 && this._move_with_mouse) {
			doNormalMove = true;
		}
	} else {
	        if (mouseButton === 1 || mouseButton === 2 || mouseButton === 3) {
        	    // 1: left button pressed; 2: middle button pressed; 3: right button pressed
	            return;
        	}

		if (event.shiftKey) {
			doNormalMove = true;
		}
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

        if (this._database_configuration.restrictions.editItemSize && doNormalMove && this._preselected_item) {
            if (this._level_annotation.type === 'SEGMENT') {
                this.moveSegmentBoundary(this._preselected_item.item, moveBy);
            } else {
                this.moveEvent(this._preselected_item.item, moveBy);
            }

            this.refreshPreselectedItem();
            this.drawData();
        } else if (this._database_configuration.restrictions.editItemSize && event.altKey && this._selected_items.length > 0) {
            if (this._level_annotation.type === 'SEGMENT') {
                this.moveSegments(this._selected_items, moveBy);
            } else if (this._level_annotation.type === 'EVENT') {
                this.moveEvents(this._selected_items, moveBy);
            }

            this.refreshPreselectedItem();
            this.drawData();
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

    protected drawData() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        drawLevelDetails(
            this.mainContext,
            this._level_annotation,
            this._attribute_name,
            this._viewport_sample_start,
            this._viewport_sample_end,
            false,
            emuWebappTheme
        );
    }

    protected drawMarkup() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        drawLevelMarkup(
            this.markupContext,
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
            emuWebappTheme
        );
    }
}
