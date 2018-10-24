import {getPixelPositionOfSampleInViewport} from '../../view-state-helper-functions';
import {FontScaleService} from '../../../_services/font-scale.service';
import {MathHelperService} from '../../../_services/math-helper.service';

export function drawSelection(ctx: CanvasRenderingContext2D,
                              drawTimeAndSamples: boolean,
                              viewportStartSample: number,
                              viewportEndSample: number,
                              selectionStartSample: number,
                              selectionEndSample: number,
                              audioBuffer: AudioBuffer,
                              primaryLineColor: string,
                              primaryFontColor: string,
                              fillColor: string) {
    if (selectionStartSample === null || selectionEndSample === null) {
        return;
    }

    const fontSize = 12;

    if (selectionStartSample === selectionEndSample) {
        const selectionPosition = getPixelPositionOfSampleInViewport(
            selectionStartSample,
            viewportStartSample,
            viewportEndSample,
            ctx.canvas.width
        ).center;

        ctx.fillStyle = primaryLineColor;
        ctx.fillRect(selectionPosition - 1, 0, 3, ctx.canvas.height);

        if (drawTimeAndSamples) {
            if (viewportStartSample !== selectionStartSample) {
                FontScaleService.drawUndistortedTextTwoLines(
                    ctx,
                    selectionStartSample.toString(),
                    MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / audioBuffer.sampleRate, 6).toString(),
                    fontSize,
                    'HelveticaNeue',
                    selectionPosition + 4,
                    0,
                    primaryFontColor,
                    'left',
                    'top'
                );
            }
        }
    } else {
        const startOfSelection = getPixelPositionOfSampleInViewport(
            selectionStartSample,
            viewportStartSample,
            viewportEndSample,
            ctx.canvas.width
        ).start;
        const endOfSelection = getPixelPositionOfSampleInViewport(
            selectionEndSample - 1,
            viewportStartSample,
            viewportEndSample,
            ctx.canvas.width
        ).end;

        ctx.fillStyle = fillColor;
        ctx.fillRect(startOfSelection, 0, endOfSelection - startOfSelection, ctx.canvas.height);
        ctx.strokeStyle = primaryLineColor;
        ctx.beginPath();
        ctx.moveTo(startOfSelection, 0);
        ctx.lineTo(startOfSelection, ctx.canvas.height);
        ctx.moveTo(endOfSelection, 0);
        ctx.lineTo(endOfSelection, ctx.canvas.height);
        ctx.stroke();

        if (drawTimeAndSamples) {
            // start values
            FontScaleService.drawUndistortedTextTwoLines(
                ctx,
                selectionStartSample.toString(),
                MathHelperService.roundToNdigitsAfterDecPoint(selectionStartSample / audioBuffer.sampleRate, 6).toString(),
                fontSize,
                'HelveticaNeue',
                startOfSelection - 5,
                0,
                primaryFontColor,
                'right',
                'top'
            );

            // end values
            FontScaleService.drawUndistortedTextTwoLines(
                ctx,
                selectionEndSample.toString(),
                MathHelperService.roundToNdigitsAfterDecPoint(selectionEndSample / audioBuffer.sampleRate, 6).toString(),
                fontSize,
                'HelveticaNeue',
                endOfSelection + 5,
                0,
                primaryFontColor,
                'left',
                'top'
            );
            // dur values
            const str1 = (selectionEndSample - selectionStartSample - 1).toString();
            const str2 = MathHelperService.roundToNdigitsAfterDecPoint(((selectionEndSample - selectionStartSample) / audioBuffer.sampleRate), 6).toString();

            // check if space
            const space = ctx.measureText(str2).width * FontScaleService.getScaleX(ctx);

            if (endOfSelection - startOfSelection > space) {
                FontScaleService.drawUndistortedTextTwoLines(
                    ctx,
                    str1,
                    str2,
                    fontSize,
                    'HelveticaNeue',
                    Math.round(startOfSelection + (endOfSelection - startOfSelection) / 2),
                    0,
                    primaryFontColor,
                    'center',
                    'top'
                );
            }
        }

    }
}
