import {Component, Input, OnInit} from '@angular/core';

import {DrawHelperService} from '../_services/draw-helper.service';
import {drawOsciMarkup} from '../_utilities/drawing/draw-osci-markup.function';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {SignalCanvasBase} from '../signal-canvas-base.class';

@Component({
    selector: 'app-osci',
    templateUrl: './osci.component.html',
    styleUrls: ['./osci.component.scss']
})
export class OsciComponent extends SignalCanvasBase implements OnInit {
    private _play_head_info;
    private osciPeaks;

    @Input() set audio_buffer(value: AudioBuffer) {
        if (value instanceof AudioBuffer) {
            this._audio_buffer = value;
            this.osciPeaks = DrawHelperService.calculateOsciPeaks(this._audio_buffer);
            this.redraw();
        }
    }

    @Input() set play_head_info(value) {
        this._play_head_info = value;
        this.drawMarkup();
    }

    protected drawData() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        DrawHelperService.freshRedrawDrawOsciOnCanvas(
            this.mainContext,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this.osciPeaks,
            this._audio_buffer,
            this._channel,
            emuWebappTheme
        );
    }

    protected drawMarkup() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        drawOsciMarkup(
            this.markupContext,
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
