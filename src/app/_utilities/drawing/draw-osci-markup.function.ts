import {Boundary} from '../../_interfaces/boundary.interface';
import {drawPlayHead} from './draw-playhead.function';
import {PlayHeadAnimationInfo} from '../../_interfaces/play-head-animation-info.interface';
import {drawMovingBoundaryLines} from './markup-elements/draw-moving-boundary-lines.function';
import {drawSelection} from './markup-elements/draw-selection.function';
import {drawVerticalCrossHair} from './markup-elements/draw-vertical-cross-hair.function';
import {EmuWebappTheme} from '../../_interfaces/emu-webapp-theme.interface';

export function drawOsciMarkup(context: CanvasRenderingContext2D,
                               viewportStartSample: number,
                               viewportEndSample: number,
                               selectionStartSample: number,
                               selectionEndSample: number,
                               movingBoundaries: Boundary[],
                               crosshairPosition: number,
                               playHeadInfo: PlayHeadAnimationInfo,
                               audioBuffer: AudioBuffer,
                               emuWebappTheme: EmuWebappTheme) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    drawMovingBoundaryLines(
        context,
        viewportStartSample,
        viewportEndSample,
        movingBoundaries,
        emuWebappTheme
    );

    // draw current viewport selected
    drawSelection(
        context,
        true,
        viewportStartSample,
        viewportEndSample,
        selectionStartSample,
        selectionEndSample,
        audioBuffer,
        emuWebappTheme
    );

    drawVerticalCrossHair(context, crosshairPosition, emuWebappTheme);

    // DrawHelperService.drawViewPortTimes(context, viewportStartSample, viewportEndSample, audioBuffer.sampleRate);

    drawPlayHead(context, playHeadInfo, viewportStartSample, viewportEndSample);
}
