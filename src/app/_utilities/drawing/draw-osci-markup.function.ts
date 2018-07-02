import {DrawHelperService} from '../../_services/draw-helper.service';

export function drawOsciMarkup(context: CanvasRenderingContext2D,
                               crosshairPosition: number) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    DrawHelperService.drawCrossHairX(context, crosshairPosition);
}
