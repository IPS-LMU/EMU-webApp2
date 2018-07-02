import {DrawHelperService} from '../../_services/draw-helper.service';
import {ILevel} from '../../_interfaces/annot-json.interface';

export function drawOsciMarkup(context: CanvasRenderingContext2D,
                               viewportStartSample: number,
                               viewportEndSample: number,
                               movingBoundaryPosition: number,
                               crosshairPosition: number) {
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

    DrawHelperService.drawCrossHairX(context, crosshairPosition);
}
