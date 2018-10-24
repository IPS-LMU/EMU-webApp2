import {getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {PlayHeadAnimationInfo} from '../../_interfaces/play-head-animation-info.interface';

export function drawPlayHead(context: CanvasRenderingContext2D,
                             playHeadInfo: PlayHeadAnimationInfo,
                             viewportStartSample: number,
                             viewportEndSample: number): void {

    const playheadStartSample = getPixelPositionOfSampleInViewport(
        playHeadInfo.sS,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    ).start;

    const playheadCurrentSample = getPixelPositionOfSampleInViewport(
        playHeadInfo.curS,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    ).start;

    context.fillStyle = 'rgba(0,0,0,0.3)';
    context.fillRect(playheadStartSample, 0, playheadCurrentSample - playheadStartSample, context.canvas.height);
}
