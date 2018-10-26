import {FontScaleService} from '../../_services/font-scale.service';
import {ILevel} from '../../_interfaces/annot-json.interface';
import {drawEvent} from './draw-event.function';
import {drawSegment} from './draw-segment.function';
import {EmuWebappTheme} from '../../_interfaces/emu-webapp-theme.interface';

export function drawLevelDetails(context: CanvasRenderingContext2D,
                                 level: ILevel,
                                 attribute: string,
                                 viewportStartSample: number,
                                 viewportEndSample: number,
                                 drawSmallVersion: boolean,
                                 emuWebappTheme: EmuWebappTheme) {
    let fontSize = emuWebappTheme.primaryFontSize;

    if (drawSmallVersion) {
        fontSize -= 2;
    }

    // Calculate width of some wide letter and some wide digit (we use 0 and m).
    // Later, the width of e.g. a 5-letter-word will be estimated to be 5 * width of an m.
    // For a 5-figure-number: 5 * width of a zero.
    // We used to measure the actual size of the the words/numbers to be drawn, but that was very slow.
    context.font = fontSize + 'px';
    const widthOfAnM = context.measureText('m').width * FontScaleService.getScaleX(context);
    const widthOfAZero = context.measureText('0').width * FontScaleService.getScaleX(context);

    context.fillStyle = emuWebappTheme.canvasBackgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // draw name and type of level
    let levelLabel;

    if (level.name === attribute) {
        levelLabel = level.name;
    } else {
        levelLabel = level.name + ':' + attribute;
    }

    const typeLabel = '(' + level.type + ')';
    const x = 10;
    const y = context.canvas.height / 2;

    if (drawSmallVersion) {
        FontScaleService.drawUndistortedText(
            context,
            levelLabel,
            fontSize,
            emuWebappTheme.primaryFontFamily,
            x,
            y,
            emuWebappTheme.primaryFontColor,
            'left',
            'middle'
        );
    } else {
        FontScaleService.drawUndistortedTextTwoLines(
            context,
            levelLabel,
            typeLabel,
            fontSize,
            emuWebappTheme.primaryFontFamily,
            x,
            y,
            emuWebappTheme.primaryFontColor,
            'left',
            'middle'
        );
    }

    if (level.type === 'SEGMENT') {
        for (const item of level.items) {
            if (item.sampleStart >= viewportStartSample &&
                item.sampleStart <= viewportEndSample || // within segment
                item.sampleStart + item.sampleDur > viewportStartSample &&
                item.sampleStart + item.sampleDur < viewportEndSample || // end in segment
                item.sampleStart < viewportStartSample &&
                item.sampleStart + item.sampleDur > viewportEndSample // within sample
            ) {
                drawSegment(
                    context, item, attribute, viewportStartSample, viewportEndSample,
                    drawSmallVersion, widthOfAnM, widthOfAZero, emuWebappTheme
                );
            }
        }
    } else if (level.type === 'EVENT') {
        for (const item of level.items) {
            if (item.samplePoint > viewportStartSample && item.samplePoint < viewportEndSample) {
                drawEvent(
                    context, item, attribute, viewportStartSample, viewportEndSample,
                    drawSmallVersion, emuWebappTheme
                );
            }
        }
    }
}
