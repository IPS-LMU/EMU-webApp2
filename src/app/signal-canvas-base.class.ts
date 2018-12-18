import {Input} from '@angular/core';

import {
    getMousePositionInCanvasX,
    getMousePositionInCanvasY,
    getSampleNumberAtCanvasMouseEvent
} from './_utilities/coordinate-system.functions';
import {adjustSelection} from './_utilities/adjust-selection.function';
import {CanvasBase} from './canvas-base.class';

export abstract class SignalCanvasBase extends CanvasBase {
    protected _channel: number;

    protected mouseY: number = null;

    @Input() set channel(value: number) {
        this._channel = value;
        this.redraw();
    }

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
