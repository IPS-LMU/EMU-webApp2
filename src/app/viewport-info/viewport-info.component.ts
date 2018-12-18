import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {drawSelection} from '../_utilities/drawing/markup-elements/draw-selection.function';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {drawViewportTimes} from '../_utilities/drawing/markup-elements/draw-viewport-times.function';
import {drawVerticalCrossHair} from '../_utilities/drawing/markup-elements/draw-vertical-cross-hair.function';

@Component({
    selector: 'app-viewport-info',
    templateUrl: './viewport-info.component.html',
    styleUrls: ['./viewport-info.component.css']
})
export class ViewportInfoComponent implements OnInit {
    private _audio_buffer: AudioBuffer;
    private _viewport_sample_start: number;
    private _viewport_sample_end: number;
    private _selection_sample_start: number;
    private _selection_sample_end: number;
    private _crosshair_position: number;

    private initialised: boolean = false;

    @Input() set audio_buffer(value: AudioBuffer){
        this._audio_buffer = value;
    }
    @Input() set viewport_sample_start(value: number){
        this._viewport_sample_start = value;
        this.redraw();
    }
    @Input() set viewport_sample_end(value: number){
        this._viewport_sample_end = value;
        this.redraw();
    }
    @Input() set selection_sample_start(value: number){
        this._selection_sample_start = value;
        this.redraw();
    }
    @Input() set selection_sample_end(value: number){
        this._selection_sample_end = value;
        this.redraw();
    }
    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.redraw();
    }

    @ViewChild('markupCanvas') markupCanvas: ElementRef;

    ngOnInit() {
        this.initialised = true;
        this.redraw();
    }

    private redraw() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        const context = this.markupCanvas.nativeElement.getContext('2d');
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        drawSelection(
            context,
            true,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this._selection_sample_start,
            this._selection_sample_end,
            this._audio_buffer,
            emuWebappTheme
        );

        drawViewportTimes(
            context,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this._audio_buffer.sampleRate,
            emuWebappTheme
        );

        drawVerticalCrossHair(
            context,
            this._crosshair_position,
            this._audio_buffer.sampleRate,
            true,
            this._viewport_sample_start,
            this._viewport_sample_end,
            emuWebappTheme
        )
    }

}
