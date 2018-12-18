import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';
import {FontScaleService} from '../../../_services/font-scale.service';
import {MathHelperService} from '../../../_services/math-helper.service';


/**
 * drawing method to drawMinMaxAndName
 * @param context is context to be drawn on
 * @param trackName name of track to be drawn in the center of the canvas (left aligned)
 * @param min value to be drawn at the bottom of the canvas (left aligned)
 * @param max value to be drawn at the top of the canvas (left aligned)
 * @param round value to round to for min/max values (== digits after comma)
 * @param emuWebappTheme A theming object with colors, font sizes etc.
 */
export function drawMinMaxAndName(context: CanvasRenderingContext2D,
                                  trackName: string,
                                  min: number,
                                  max: number,
                                  round: number,
                                  emuWebappTheme: EmuWebappTheme) {
    // draw corner pointers
    context.strokeStyle = emuWebappTheme.primaryLineColor;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(5, 5);
    context.moveTo(0, context.canvas.height);
    context.lineTo(5, context.canvas.height - 5);
    context.stroke();

    // draw trackName
    if (trackName !== '') {
        FontScaleService.drawUndistortedText(context, trackName, emuWebappTheme.primaryFontSize, emuWebappTheme.primaryFontFamily, 5, context.canvas.height / 2, emuWebappTheme.primaryFontColor, 'left', 'middle');
    }

    // draw min/max values
    if (max !== undefined) {
        FontScaleService.drawUndistortedText(context, 'max: ' + MathHelperService.roundToNdigitsAfterDecPoint(max, round), emuWebappTheme.primaryFontSize, emuWebappTheme.primaryFontFamily, 5, 0, emuWebappTheme.primaryFontColor, 'left', 'top');
    }
    if (min !== undefined) {
        FontScaleService.drawUndistortedText(context, 'min: ' + MathHelperService.roundToNdigitsAfterDecPoint(min, round), emuWebappTheme.primaryFontSize, emuWebappTheme.primaryFontFamily, 5, context.canvas.height - 5, emuWebappTheme.primaryFontColor, 'left', 'bottom');
    }
}
