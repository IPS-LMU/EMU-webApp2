import {LevelService} from '../../_services/level.service';
import {IItem} from '../../_interfaces/annot-json.interface';
import {getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {FontScaleService} from '../../_services/font-scale.service';

export function drawSegment(ctx: CanvasRenderingContext2D,
                            item: IItem,
                            attribute: string,
                            viewportStartSample: number,
                            viewportEndSample: number,
                            primaryFontColor: string,
                            secondaryFontColor: string,
                            primaryLineColor: string,
                            secondaryLineColor: string,
                            fontSize: number,
                            fontFamily: string,
                            drawSmallVersion: boolean,
                            widthOfAnM: number,
                            widthOfAZero: number) {
    const labelValue = LevelService.getLabelByAttribute(item, attribute);

    // draw segment start
    const posS = getPixelPositionOfSampleInViewport(item.sampleStart, viewportStartSample, viewportEndSample, ctx.canvas.width).start;
    const posE = getPixelPositionOfSampleInViewport(
        item.sampleStart + item.sampleDur,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    ).end;

    ctx.fillStyle = primaryLineColor;
    ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

    // draw segment end
    ctx.fillStyle = secondaryLineColor;
    ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

    // check for enough space to stroke text
    if ((labelValue !== undefined) && posE - posS > (widthOfAnM * labelValue.length)) {
        if (drawSmallVersion) {
            FontScaleService.drawUndistortedText(ctx, labelValue, fontSize - 2, fontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2), primaryFontColor, 'center', 'baseline');
        } else {
            FontScaleService.drawUndistortedText(ctx, labelValue, fontSize - 2, fontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2), primaryFontColor, 'center', 'baseline');
        }
    }

    // draw helper lines
    if (!drawSmallVersion && labelValue !== undefined && labelValue.length !== 0) { // only draw if label is not empty
        const labelCenter = posS + (posE - posS) / 2;

        let hlY = ctx.canvas.height / 4;
        // start helper line
        ctx.strokeStyle = primaryLineColor;
        ctx.beginPath();
        ctx.moveTo(posS, hlY);
        ctx.lineTo(labelCenter, hlY);
        ctx.lineTo(labelCenter, hlY + 5);
        ctx.stroke();

        hlY = ctx.canvas.height / 4 * 3;
        // end helper line
        ctx.strokeStyle = secondaryLineColor;
        ctx.beginPath();
        ctx.moveTo(posE, hlY);
        ctx.lineTo(labelCenter, hlY);
        ctx.lineTo(labelCenter, hlY - 5);
        ctx.stroke();
    }

    if (!drawSmallVersion) {
        // draw sampleStart numbers
        // check for enough space to stroke text
        if (posE - posS > widthOfAZero * item.sampleStart.toString().length) {
            FontScaleService.drawUndistortedText(
                ctx, item.sampleStart.toString(), fontSize - 2, fontFamily, posS + 3, 0, secondaryFontColor, 'left', 'top'
            );
        }

        // draw sample duration numbers
        const durtext = 'dur: ' + item.sampleDur + ' ';
        // check for enough space to stroke text
        if (posE - posS > widthOfAZero * durtext.length) {
            FontScaleService.drawUndistortedText(
                ctx,
                durtext,
                fontSize - 2,
                fontFamily,
                posE,
                ctx.canvas.height / 4 * 3,
                secondaryFontColor,
                'right',
                'top'
            );
        }
    }
}
