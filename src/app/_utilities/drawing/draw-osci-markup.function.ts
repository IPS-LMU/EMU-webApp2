import {DrawHelperService} from '../../_services/draw-helper.service';
import {Boundary} from '../../_interfaces/boundary.interface';
import {drawPlayHead} from './draw-playhead.function';
import {PlayHeadAnimationInfo} from '../../_interfaces/play-head-animation-info.interface';
import {drawMovingBoundaryLines} from './markup-elements/draw-moving-boundary-lines.function';

export function drawOsciMarkup(context: CanvasRenderingContext2D,
                               viewportStartSample: number,
                               viewportEndSample: number,
                               selectionStartSample: number,
                               selectionEndSample: number,
                               movingBoundaries: Boundary[],
                               crosshairPosition: number,
                               playHeadInfo: PlayHeadAnimationInfo,
                               audioBuffer: AudioBuffer) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    drawMovingBoundaryLines(
        context,
        viewportStartSample,
        viewportEndSample,
        movingBoundaries
    );

    // draw current viewport selected
    DrawHelperService.drawCurViewPortSelected(
        context,
        true,
        viewportStartSample,
        viewportEndSample,
        selectionStartSample,
        selectionEndSample,
        audioBuffer,
        'black',
        'black',
        'rgba(0,0,0, 0.3)'
    );

    DrawHelperService.drawCrossHairX(context, crosshairPosition);

    // DrawHelperService.drawViewPortTimes(context, viewportStartSample, viewportEndSample, audioBuffer.sampleRate);

    drawPlayHead(context, playHeadInfo, viewportStartSample, viewportEndSample);
}
