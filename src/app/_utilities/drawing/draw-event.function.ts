import {LevelService} from '../../_services/level.service';
import {getPixelDistanceBetweenSamples, getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {FontScaleService} from '../../_services/font-scale.service';
import {IItem} from '../../_interfaces/annot-json.interface';

export function drawEvent(context: CanvasRenderingContext2D,
                          item: IItem,
                          attribute: string,
                          viewportStartSample: number,
                          viewportEndSample: number,
                          primaryFontColor: string,
                          secondaryFontColor: string,
                          primaryLineColor: string,
                          fontSize: number,
                          fontFamily: string,
                          drawSmallVersion: boolean) {

    const labelValue = LevelService.getLabelByAttribute(item, attribute);

    const position = getPixelPositionOfSampleInViewport(
        item.samplePoint,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    );

    const sDist = getPixelDistanceBetweenSamples(viewportStartSample, viewportEndSample, context.canvas.width);
    const perc = Math.round(position + (sDist / 2));

    context.fillStyle = primaryLineColor;
    context.fillRect(perc, 0, 1, context.canvas.height / 2 - context.canvas.height / 5);
    context.fillRect(perc, context.canvas.height / 2 + context.canvas.height / 5, 1, context.canvas.height / 2 - context.canvas.height / 5);

    FontScaleService.drawUndistortedText(
        context,
        labelValue,
        fontSize - 2,
        fontFamily,
        perc,
        (context.canvas.height / 2) - (fontSize - 2) + 2,
        primaryFontColor,
        false
    );

    if (!drawSmallVersion) {
        FontScaleService.drawUndistortedText(
            context,
            item.samplePoint,
            fontSize - 2,
            fontFamily,
            perc + 5,
            0,
            secondaryFontColor,
            true
        );
    }
}