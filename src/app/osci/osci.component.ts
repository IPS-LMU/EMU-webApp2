import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {DrawHelperService} from '../_services/draw-helper.service';
import {getMousePositionInCanvasX, getSampleNumberAtCanvasMouseEvent} from '../_utilities/coordinate-system.functions';
import {drawOsciMarkup} from '../_utilities/drawing/draw-osci-markup.function';
import {adjustSelection} from '../_utilities/adjust-selection.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';

@Component({
    selector: 'app-osci',
    templateUrl: './osci.component.html',
    styleUrls: ['./osci.component.scss']
})
export class OsciComponent implements OnInit {
    private _audio_buffer: AudioBuffer;
    private _channel: number;
    private _moving_boundaries: Boundary[];
    private _crosshair_position: number;
    private _selection_sample_start: number;
    private _selection_sample_end: number;
    private _viewport_sample_start: number;
    private _viewport_sample_end: number;
    private _play_head_info;

    private initialised: boolean = false;
    private osciPeaks;

    @Input() set audio_buffer(value: AudioBuffer) {
        if (value instanceof AudioBuffer) {
            this._audio_buffer = value;
            this.osciPeaks = DrawHelperService.calculateOsciPeaks(this._audio_buffer);
            this.redraw();
        }
    }

    @Input() set channel(value: number) {
        this._channel = value;
        this.redraw();
    }

    @Input() set moving_boundaries(value: Boundary[]) {
        this._moving_boundaries = value;
        this.drawOsciMarkup();
    }

    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.drawOsciMarkup();
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
        this.drawOsciMarkup();
    }

    @Input() set selection_sample_end(value: number) {
        this._selection_sample_end = value;
        this.drawOsciMarkup();
    }

    @Input() set play_head_info(value) {
        this._play_head_info = value;
        this.drawOsciMarkup();
    }

    @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
    @Output() selection_change: EventEmitter<{ start: number, end: number }> = new EventEmitter<{ start: number, end: number }>();

    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    @ViewChild('markupCanvas') markupCanvas: ElementRef;

    ngOnInit() {
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

    public mousemove(event: MouseEvent) {
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

    private redraw() {
        this.drawOsci();
        this.drawOsciMarkup();
    }

    private drawOsci() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        const context = this.mainCanvas.nativeElement.getContext('2d');
        DrawHelperService.freshRedrawDrawOsciOnCanvas(
            context,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this.osciPeaks,
            this._audio_buffer,
            this._channel,
            emuWebappTheme
        );
    }

    private drawOsciMarkup() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        const context = this.markupCanvas.nativeElement.getContext('2d');
        drawOsciMarkup(
            context,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this._selection_sample_start,
            this._selection_sample_end,
            this._moving_boundaries,
            this._crosshair_position,
            this._play_head_info,
            this._audio_buffer,
            emuWebappTheme
        );
    }
}
