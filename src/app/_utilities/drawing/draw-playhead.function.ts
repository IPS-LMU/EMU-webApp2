import {getCanvasCoordinateOfSample} from '../view-state-helper-functions';
import {PlayHeadAnimationInfo} from '../../_interfaces/play-head-animation-info.interface';
import {EmuWebappTheme} from '../../_interfaces/emu-webapp-theme.interface';

export function drawPlayHead(context: CanvasRenderingContext2D,
                             playHeadInfo: PlayHeadAnimationInfo,
                             viewportStartSample: number,
                             viewportEndSample: number,
                             emuWebappTheme: EmuWebappTheme): void {

    const playheadStartSample = getCanvasCoordinateOfSample(
        playHeadInfo.sS,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    ).start;

    const playheadCurrentSample = getCanvasCoordinateOfSample(
        playHeadInfo.curS,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    ).start;

    context.fillStyle = emuWebappTheme.selectionOverlayColor;
    context.fillRect(playheadStartSample, 0, playheadCurrentSample - playheadStartSample, context.canvas.height);
}
