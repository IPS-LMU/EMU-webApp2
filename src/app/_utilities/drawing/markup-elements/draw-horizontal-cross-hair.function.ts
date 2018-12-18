import {FontScaleService} from '../../../_services/font-scale.service';
import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';

export function drawHorizontalCrossHair(context: CanvasRenderingContext2D,
                                        mouseY: number,
                                        labelValue: number,
                                        unit: string,
                                        emuWebappTheme: EmuWebappTheme) {
    // Draw line
    context.strokeStyle = emuWebappTheme.crossHairColor;

    context.beginPath();
    context.moveTo(0, mouseY);
    context.lineTo(context.canvas.width, mouseY);
    context.stroke();

    // Draw y value - either below the axis if there's enough space, or above the axis otherwise
    const textHeight = emuWebappTheme.primaryFontSize * FontScaleService.getScaleY(context);
    let labelPositionY: number;
    let verticalAnchor;

    if (mouseY + textHeight * 3 > context.canvas.height) {
        labelPositionY = mouseY - 5;
        verticalAnchor = 'bottom';

    } else {
        labelPositionY = mouseY + 5;
        verticalAnchor = 'top';
    }

    FontScaleService.drawUndistortedText(context, labelValue + ' ' + unit, emuWebappTheme.primaryFontSize, emuWebappTheme.primaryFontFamily, 5, labelPositionY, emuWebappTheme.crossHairColor, 'left', verticalAnchor);
    FontScaleService.drawUndistortedText(context, labelValue + ' ' + unit, emuWebappTheme.primaryFontSize, emuWebappTheme.primaryFontFamily, context.canvas.width, labelPositionY, emuWebappTheme.crossHairColor, 'right', verticalAnchor);

    context.beginPath();
    context.moveTo(0, mouseY);
    context.lineTo(5, labelPositionY);
    context.moveTo(context.canvas.width, mouseY);
    context.lineTo(context.canvas.width - 5, labelPositionY);
    context.stroke();
}
