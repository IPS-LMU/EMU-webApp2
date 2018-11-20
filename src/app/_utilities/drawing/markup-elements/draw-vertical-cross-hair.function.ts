import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';
import {FontScaleService} from '../../../_services/font-scale.service';
import {MathHelperService} from '../../../_services/math-helper.service';
import {getSampleAtCanvasCoordinate} from '../../view-state-helper-functions';

export function drawVerticalCrossHair(context: CanvasRenderingContext2D,
                                      mouseX: number,
                                      sampleRate: number,
                                      drawTimeAndSamples: boolean,
                                      viewportStartSample: number,
                                      viewportEndSample: number,
                                      emuWebappTheme: EmuWebappTheme) {
    if (mouseX === null) {
        return;
    }
    context.strokeStyle = emuWebappTheme.crossHairColor;
    context.beginPath();
    context.moveTo(mouseX, 0);
    context.lineTo(mouseX, context.canvas.height);
    context.stroke();

    const sample = getSampleAtCanvasCoordinate(
        mouseX,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width,
    );

    if (drawTimeAndSamples) {
        FontScaleService.drawUndistortedTextTwoLines(
            context,
            sample.toString(),
            MathHelperService.roundToNdigitsAfterDecPoint(sample / sampleRate * 1000, 1).toString() + ' ms',
            emuWebappTheme.primaryFontSize,
            emuWebappTheme.primaryFontFamily,
            mouseX + 4,
            0,
            emuWebappTheme.crossHairColor,
            'left',
            'top'
        );
    }
}
