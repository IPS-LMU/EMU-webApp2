import {ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {
    getMousePositionInCanvasX,
    getMousePositionInCanvasY,
    getSampleNumberAtCanvasMouseEvent
} from './_utilities/coordinate-system.functions';
import {adjustSelection} from './_utilities/adjust-selection.function';
import {Boundary} from './_interfaces/boundary.interface';

export abstract class SignalCanvasBase implements OnInit {
    protected _audio_buffer: AudioBuffer;
    protected _channel: number;
    protected _moving_boundaries: Boundary[];
    protected _crosshair_position: number;
    protected _selection_sample_start: number;
    protected _selection_sample_end: number;
    protected _viewport_sample_start: number;
    protected _viewport_sample_end: number;

    protected initialised: boolean = false;
    protected mainContext: CanvasRenderingContext2D;
    protected markupContext: CanvasRenderingContext2D;
    protected mouseY: number = null;

    @Input() set audio_buffer(value: AudioBuffer) {
        this._audio_buffer = value;
        this.redraw();
    }

    @Input() set channel(value: number) {
        this._channel = value;
        this.redraw();
    }

    @Input() set moving_boundaries(value: Boundary[]) {
        this._moving_boundaries = value;
        this.drawMarkup();
    }

    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.drawMarkup();
    }

    @Input() set viewport_sample_start(value: number) {
        this._viewport_sample_start = value;
        this.redraw();
    }

    @Input() set viewport_sample_end(value: number) {
        this._viewport_sample_end = value;
        this.redraw();
    }

    @Input() set selection_sample_start(value: number) {
        this._selection_sample_start = value;
        this.drawMarkup();
    }

    @Input() set selection_sample_end(value: number) {
        this._selection_sample_end = value;
        this.drawMarkup();
    }

    @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
    @Output() selection_change: EventEmitter<{ start: number, end: number }> = new EventEmitter<{ start: number, end: number }>();

    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    @ViewChild('markupCanvas') markupCanvas: ElementRef;

    ngOnInit() {
        this.mainContext = this.mainCanvas.nativeElement.getContext('2d');
        this.markupContext = this.markupCanvas.nativeElement.getContext('2d');

        this.initialised = true;
        this.redraw();
    }

    protected redraw() {
        this.drawData();
        this.drawMarkup();
    }

    protected abstract drawData(): void;

    protected abstract drawMarkup(): void;

    public handleMouseDown(mouseDownEvent: MouseEvent) {
        const sampleAtMousePosition = getSampleNumberAtCanvasMouseEvent(
            mouseDownEvent,
            this._viewport_sample_start,
            this._viewport_sample_end
        );

        if (mouseDownEvent.shiftKey && this._selection_sample_start !== null) {
            this.selection_change.emit(adjustSelection(
                sampleAtMousePosition,
                this._selection_sample_start,
                this._selection_sample_end
            ));
        } else {
            this.selection_change.emit({start: sampleAtMousePosition, end: sampleAtMousePosition});
        }
    }

    public handleMouseMove(mouseMoveEvent: MouseEvent) {
        this.crosshair_move.emit(getMousePositionInCanvasX(mouseMoveEvent));

        let mouseButton: number;
        if (mouseMoveEvent.buttons === undefined) {
            mouseButton = mouseMoveEvent.which;
        } else {
            mouseButton = mouseMoveEvent.buttons;
        }

        if (mouseButton === 1) {
            const sampleAtMousePosition = getSampleNumberAtCanvasMouseEvent(
                mouseMoveEvent,
                this._viewport_sample_start,
                this._viewport_sample_end
            );

            this.selection_change.emit(adjustSelection(
                sampleAtMousePosition,
                this._selection_sample_start,
                this._selection_sample_end
            ));
        }

        this.mouseY = getMousePositionInCanvasY(mouseMoveEvent);
        this.drawMarkup();
    }

    public handleMouseLeave(mouseLeaveEvent: MouseEvent) {
        this.mouseY = null;
    }
}
