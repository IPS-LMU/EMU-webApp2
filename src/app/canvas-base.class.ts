import {ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {Boundary} from './_interfaces/boundary.interface';

export abstract class CanvasBase implements OnInit {
    protected _audio_buffer: AudioBuffer;
    protected _moving_boundaries: Boundary[];
    protected _crosshair_position: number;
    protected _selection_sample_start: number;
    protected _selection_sample_end: number;
    protected _viewport_sample_start: number;
    protected _viewport_sample_end: number;

    protected initialised: boolean = false;
    protected mainContext: CanvasRenderingContext2D;
    protected markupContext: CanvasRenderingContext2D;

    @Input() set audio_buffer(value: AudioBuffer) {
        if (value instanceof AudioBuffer) {
            this._audio_buffer = value;
            this.redraw();
        }
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

    public redraw() {
        this.drawData();
        this.drawMarkup();
    }

    public abstract drawData(): void;

    public abstract drawMarkup(): void;
}
