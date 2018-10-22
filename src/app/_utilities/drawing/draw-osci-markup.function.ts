import {DrawHelperService} from '../../_services/draw-helper.service';
import {ILevel} from '../../_interfaces/annot-json.interface';

export function drawOsciMarkup(context: CanvasRenderingContext2D,
                               viewportStartSample: number,
                               viewportEndSample: number,
                               selectionStartSample: number,
                               selectionEndSample: number,
                               movingBoundaryPosition: number,
                               crosshairPosition: number,
                               audioBuffer: AudioBuffer,
                               currentMouseOverLevel: ILevel) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // draw moving boundary line if moving
    if (movingBoundaryPosition) {
        DrawHelperService.drawMovingBoundaryLine(
            context,
            viewportStartSample,
            viewportEndSample,
            movingBoundaryPosition,
            false, //@todo preselectedItem.isLast,
            {type: 'SEGMENT'} as ILevel // mouseoverLevel
        );
    }

    // draw current viewport selected
    DrawHelperService.drawCurViewPortSelected(
        context,
        false,
        viewportStartSample,
        viewportEndSample,
        selectionStartSample,
        selectionEndSample,
        audioBuffer,
        currentMouseOverLevel,
        'black',
        'rgba(0,0,0, 0.3)'
    );

    DrawHelperService.drawCrossHairX(context, crosshairPosition);

    // DrawHelperService.drawViewPortTimes(context, viewportStartSample, viewportEndSample, audioBuffer.sampleRate);
}
