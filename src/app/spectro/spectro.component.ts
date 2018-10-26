import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {MathHelperService} from '../_services/math-helper.service';
import {FontScaleService} from '../_services/font-scale.service';
import {
    getMousePositionInCanvasX, getMousePositionInCanvasY,
    getSampleNumberAtCanvasMouseEvent,
    getSamplesPerCanvasWidthUnit
} from '../_utilities/view-state-helper-functions';
import {SpectrogramSettings} from '../_interfaces/spectrogram-settings.interface';
import {adjustSelection} from '../_utilities/adjust-selection.function';
import {Boundary} from '../_interfaces/boundary.interface';
import {drawMovingBoundaryLines} from '../_utilities/drawing/markup-elements/draw-moving-boundary-lines.function';
import {drawSelection} from '../_utilities/drawing/markup-elements/draw-selection.function';
import {drawVerticalCrossHair} from '../_utilities/drawing/markup-elements/draw-vertical-cross-hair.function';
import {spectrogramWorker} from '../_workers/spectrogram-worker.function';
import {emuWebappTheme} from '../_utilities/emu-webapp-theme.object';
import {drawMinMaxAndName} from '../_utilities/drawing/markup-elements/draw-min-max-and-name.function';
import {drawHorizontalCrossHair} from '../_utilities/drawing/markup-elements/draw-horizontal-cross-hair.function';

@Component({
    selector: 'app-spectro',
    templateUrl: './spectro.component.html',
    styleUrls: ['./spectro.component.scss']
})
export class SpectroComponent implements OnInit {

    private _audio_buffer: AudioBuffer;
    private _channel: number;
    private _viewport_sample_start: number;
    private _viewport_sample_end: number;
    private _selection_sample_start: number;
    private _selection_sample_end: number;
    private _crosshair_position: number;
    private _moving_boundaries: Boundary[];
    private _spectrogram_settings: SpectrogramSettings;
    private _main_context;
    private _markup_context: CanvasRenderingContext2D;
    private worker;
    private workerFunctionURL;
    private initialised: boolean = false;
    private mouseY: number = null;

    // FFT default vars
    // default alpha for Window Function
    private alpha: number = 0.16;
    private devicePixelRatio = window.devicePixelRatio || 1;

    @Input() set spectrogram_settings(value: SpectrogramSettings) {
        this._spectrogram_settings = value;
        this.redraw();
    }

    @Input() set audio_buffer(value: AudioBuffer) {
        this._audio_buffer = value;
        this.redraw();
    }

    @Input() set channel(value: number) {
        this._channel = value;
        this.redraw();
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
        this.drawSpectMarkup();
    }

    @Input() set selection_sample_end(value: number) {
        this._selection_sample_end = value;
        this.drawSpectMarkup();
    }

    @Input() set crosshair_position(value: number) {
        this._crosshair_position = value;
        this.drawSpectMarkup();
    }

    @Input() set moving_boundaries(value: Boundary[]) {
        this._moving_boundaries = value;
        this.drawSpectMarkup();
    }

    @Output() crosshair_move: EventEmitter<number> = new EventEmitter<number>();
    @Output() selection_change: EventEmitter<{ start: number, end: number }> = new EventEmitter<{ start: number, end: number }>();

    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    @ViewChild('markupCanvas') markupCanvas: ElementRef;

    constructor() {
        const workerFunctionBlob = new Blob(['(' + spectrogramWorker.toString() + ')();'], {type: 'text/javascript'});
        this.workerFunctionURL = window.URL.createObjectURL(workerFunctionBlob);
        this.worker = new Worker(this.workerFunctionURL);
    }

    ngOnInit() {
        this.initialised = true;

        this._main_context = this.mainCanvas.nativeElement.getContext('2d');
        this._markup_context = this.markupCanvas.nativeElement.getContext('2d');
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

    public mouseleave(event: MouseEvent) {
        this.mouseY = null;
    }

    public mousemove(event: MouseEvent) {
        this.crosshair_move.emit(getMousePositionInCanvasX(event));
        this.mouseY = getMousePositionInCanvasY(event);
        this.drawSpectMarkup();

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

    redraw() {
        this.drawSpectMarkup();
        this.drawSpectro();
    }

    drawSpectro() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        const buffer = this._audio_buffer.getChannelData(this._channel);

        this.killSpectroRenderingThread();
        this.startSpectroRenderingThread(buffer);
    }


    drawSpectMarkup() {
        if (!this.initialised || !this._audio_buffer) {
            return;
        }

        this._markup_context.clearRect(0, 0, this.markupCanvas.nativeElement.width, this.markupCanvas.nativeElement.height);

        drawMovingBoundaryLines(
            this._markup_context,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this._moving_boundaries,
            emuWebappTheme
        );

        drawSelection(
            this._markup_context,
            false,
            this._viewport_sample_start,
            this._viewport_sample_end,
            this._selection_sample_start,
            this._selection_sample_end,
            this._audio_buffer,
            emuWebappTheme
        );

        // draw min max vals and name of track
        drawMinMaxAndName(
            this._markup_context,
            '',
            this._spectrogram_settings.rangeFrom,
            this._spectrogram_settings.rangeTo,
            2,
            emuWebappTheme
        );

        drawVerticalCrossHair(
            this._markup_context,
            this._crosshair_position,
            this._audio_buffer.sampleRate,
            false,
            this._viewport_sample_start,
            this._viewport_sample_end,
            emuWebappTheme
        );

        if (this.mouseY !== null) {
            const max = this._spectrogram_settings.rangeTo;
            let valueAtMousePosition = max - this.mouseY / this._markup_context.canvas.height * max; // SIC only uses max
            valueAtMousePosition = MathHelperService.roundToNdigitsAfterDecPoint(valueAtMousePosition, 2);

            drawHorizontalCrossHair(
                this._markup_context,
                this.mouseY,
                valueAtMousePosition,
                'Hz',
                emuWebappTheme
            );
        }
    }

    killSpectroRenderingThread() {
        this._main_context.fillStyle = 'lightgrey';
        this._main_context.fillRect(0, 0, this.markupCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

        FontScaleService.drawUndistortedText(
            this._main_context,
            'rendering...',
            12 * 0.75,
            'HelveticaNeue',
            10,
            this._main_context.canvas.height / 2,
            'black',
            'left',
            'middle'
        );

        if (this.worker !== null) {
            this.worker.terminate();
            this.worker = null;
        }

        this.drawSpectMarkup();
    }

    setupEvent() {
        const imageData = this._main_context.createImageData(this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

        this.worker.onmessage = (event) => {
            if (event.data.status === undefined) {
                const samplesPerPxl = getSamplesPerCanvasWidthUnit(
                    this._viewport_sample_start,
                    this._viewport_sample_end,
                    this.mainCanvas.nativeElement
                );
                if (samplesPerPxl === event.data.samplesPerPxl) {
                    const tmp = new Uint8ClampedArray(event.data.img);
                    imageData.data.set(tmp);
                    this._main_context.putImageData(imageData, 0, 0);
                    this.drawSpectMarkup();
                }
            } else {
                // console.error('Error rendering spectrogram:', event.data.status.message);
            }
        };
    }

    startSpectroRenderingThread(buffer) {
        if (buffer.length > 0) {
            // this.worker = new SpectroDrawingWorker();
            this.worker = new Worker(this.workerFunctionURL);

            let parseData: any = [];
            let fftN = MathHelperService.calcClosestPowerOf2Gt(this._audio_buffer.sampleRate * this._spectrogram_settings.windowSizeInSecs);
            // fftN must be greater than 512 (leads to better resolution of spectrogram)
            if (fftN < 512) {
                fftN = 512;
            }
            // extract relavant data
            parseData = buffer.slice(this._viewport_sample_start, this._viewport_sample_end);

            let leftPadding: any = [];
            let rightPadding: any = [];

            // check if any zero padding at LEFT edge is necessary
            const windowSizeInSamples = this._audio_buffer.sampleRate * this._spectrogram_settings.windowSizeInSecs;
            if (this._viewport_sample_start < windowSizeInSamples / 2) {
                // should do something here... currently always padding with zeros!
            } else {
                leftPadding = buffer.slice(this._viewport_sample_start - windowSizeInSamples / 2, this._viewport_sample_start);
            }
            // check if zero padding at RIGHT edge is necessary
            if (this._viewport_sample_end + fftN / 2 - 1 >= this._audio_buffer.length) {
                // should do something here... currently always padding with zeros!
            } else {
                rightPadding = buffer.slice(this._viewport_sample_end, this._viewport_sample_end + fftN / 2 - 1);
            }
            // add padding
            const paddedSamples = new Float32Array(leftPadding.length + parseData.length + rightPadding.length);
            paddedSamples.set(leftPadding);
            paddedSamples.set(parseData, leftPadding.length);
            paddedSamples.set(rightPadding, leftPadding.length + parseData.length);

            // if (this.view_state_service.curViewPort.sS >= fftN / 2) {
            //   // pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
            //   parseData = ArrayBufferHelperService.subarray(buffer,this.view_state_service.curViewPort.sS - fftN / 2, this.view_state_service.curViewPort.eS + fftN);
            // } else {
            //   // tolerate window/2 alignment issue if at beginning of file
            //   parseData = ArrayBufferHelperService.subarray(buffer, this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS + fftN);
            // }
            this.setupEvent();
            // console.log(paddedSamples.buffer);
            this.worker.postMessage({
                'windowSizeInSecs': this._spectrogram_settings.windowSizeInSecs,
                'fftN': fftN,
                'alpha': this.alpha,
                'upperFreq': this._spectrogram_settings.rangeTo,
                'lowerFreq': this._spectrogram_settings.rangeFrom,
                'samplesPerPxl': getSamplesPerCanvasWidthUnit(
                    this._viewport_sample_start,
                    this._viewport_sample_end,
                    this.mainCanvas.nativeElement
                ),
                'window': this._spectrogram_settings.window,
                'imgWidth': this.mainCanvas.nativeElement.width,
                'imgHeight': this.mainCanvas.nativeElement.height,
                'dynRangeInDB': this._spectrogram_settings.dynamicRange,
                'pixelRatio': this.devicePixelRatio,
                'sampleRate': this._audio_buffer.sampleRate,
                'transparency': this._spectrogram_settings.transparency,
                'audioBuffer': paddedSamples.buffer,
                'audioBufferChannels': this._audio_buffer.numberOfChannels,
                'drawHeatMapColors': this._spectrogram_settings.drawHeatMapColors,
                'preEmphasisFilterFactor': this._spectrogram_settings.preEmphasisFilterFactor,
                'heatMapColorAnchors': this._spectrogram_settings.heatMapColorAnchors
            }, [paddedSamples.buffer]);
        }
    }
}
