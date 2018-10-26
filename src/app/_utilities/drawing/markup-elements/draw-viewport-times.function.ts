import {MathHelperService} from '../../../_services/math-helper.service';
import {FontScaleService} from '../../../_services/font-scale.service';
import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';

export function drawViewportTimes(context: CanvasRenderingContext2D,
                                  viewportStartSample: number,
                                  viewportEndSample: number,
                                  sampleRate: number,
                                  emuWebappTheme: EmuWebappTheme) {
    const viewportStartTime = MathHelperService.roundToNdigitsAfterDecPoint(viewportStartSample / sampleRate, 6);
    const viewportEndTime = MathHelperService.roundToNdigitsAfterDecPoint(viewportEndSample / sampleRate, 6);

    FontScaleService.drawUndistortedTextTwoLines(
        context,
        viewportStartSample.toString(),
        viewportStartTime.toString(),
        emuWebappTheme.primaryFontSize,
        emuWebappTheme.primaryFontFamily,
        5,
        0,
        emuWebappTheme.primaryFontColor,
        'left',
        'top'
    );
    FontScaleService.drawUndistortedTextTwoLines(
        context,
        viewportEndSample.toString(),
        viewportEndTime.toString(),
        emuWebappTheme.primaryFontSize,
        emuWebappTheme.primaryFontFamily,
        context.canvas.width - 5,
        0,
        emuWebappTheme.primaryFontColor,
        'right',
        'top'
    );

    // small diagonal lines to corners
    context.strokeStyle = emuWebappTheme.primaryLineColor;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(5, 5);
    context.moveTo(context.canvas.width, 0);
    context.lineTo(context.canvas.width - 5, 5);
    context.closePath();
    context.stroke();
}
