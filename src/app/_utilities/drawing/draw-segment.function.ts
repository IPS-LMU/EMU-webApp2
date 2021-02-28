import {LevelService} from '../../_services/level.service';
import {IItem} from '../../_interfaces/annot-json.interface';
import {getCanvasCoordinateOfSample} from '../coordinate-system.functions';
import {FontScaleService} from '../../_services/font-scale.service';
import {EmuWebappTheme} from '../../_interfaces/emu-webapp-theme.interface';

export function drawSegment(ctx: CanvasRenderingContext2D,
                            item: IItem,
                            attribute: string,
                            viewportStartSample: number,
                            viewportEndSample: number,
                            drawSmallVersion: boolean,
                            drawSegmentTimes: boolean,
                            widthOfAnM: number,
                            widthOfAZero: number,
                            emuWebappTheme: EmuWebappTheme) {
    const labelValue = LevelService.getLabelByAttribute(item, attribute);

    // draw segment start
    const posS = getCanvasCoordinateOfSample(item.sampleStart, viewportStartSample, viewportEndSample, ctx.canvas.width).start;
    const posE = getCanvasCoordinateOfSample(
        item.sampleStart + item.sampleDur,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    ).end;

    ctx.fillStyle = emuWebappTheme.primaryLineColor;
    ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

    // draw segment end
    ctx.fillStyle = emuWebappTheme.secondaryLineColor;
    ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

    // draw segment fill
    if (emuWebappTheme.itemBackgroundColor) {
        ctx.fillStyle = emuWebappTheme.itemBackgroundColor;
        ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
    }

    // check for enough space to stroke text
    if ((labelValue !== undefined) && posE - posS > (widthOfAnM * labelValue.length)) {
        if (drawSmallVersion) {
            FontScaleService.drawUndistortedText(ctx, labelValue, emuWebappTheme.primaryFontSize - 2, emuWebappTheme.primaryFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2), emuWebappTheme.primaryFontColor, 'center', 'middle');
        } else {
            FontScaleService.drawUndistortedText(ctx, labelValue, emuWebappTheme.primaryFontSize - 2, emuWebappTheme.primaryFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2), emuWebappTheme.primaryFontColor, 'center', 'middle');
        }
    }

    // draw helper lines
    if (!drawSmallVersion && labelValue !== undefined && labelValue.length !== 0) { // only draw if label is not empty
        const labelCenter = posS + (posE - posS) / 2;

        let hlY = ctx.canvas.height / 4;
        // start helper line
        ctx.strokeStyle = emuWebappTheme.primaryLineColor;
        ctx.beginPath();
        ctx.moveTo(posS, hlY);
        ctx.lineTo(labelCenter, hlY);
        ctx.lineTo(labelCenter, hlY + 5);
        ctx.stroke();

        hlY = ctx.canvas.height / 4 * 3;
        // end helper line
        ctx.strokeStyle = emuWebappTheme.secondaryLineColor;
        ctx.beginPath();
        ctx.moveTo(posE, hlY);
        ctx.lineTo(labelCenter, hlY);
        ctx.lineTo(labelCenter, hlY - 5);
        ctx.stroke();
    }

    if (drawSegmentTimes) {
        // draw sampleStart numbers
        // check for enough space to stroke text
        if (posE - posS > widthOfAZero * item.sampleStart.toString().length) {
            FontScaleService.drawUndistortedText(
                ctx, item.sampleStart.toString(), emuWebappTheme.primaryFontSize - 2, emuWebappTheme.primaryFontFamily,
                posS + 3, 0, emuWebappTheme.secondaryFontColor, 'left', 'top'
            );
        }

        // draw sample duration numbers
        const durtext = 'dur: ' + item.sampleDur + ' ';
        // check for enough space to stroke text
        if (posE - posS > widthOfAZero * durtext.length) {
            FontScaleService.drawUndistortedText(
                ctx,
                durtext,
                emuWebappTheme.primaryFontSize - 2,
                emuWebappTheme.primaryFontFamily,
                posE,
                ctx.canvas.height / 4 * 3,
                emuWebappTheme.secondaryFontColor,
                'right',
                'top'
            );
        }
    }
}
