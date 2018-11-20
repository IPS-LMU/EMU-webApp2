import {LevelService} from '../../_services/level.service';
import {getCanvasCoordinateOfSample} from '../view-state-helper-functions';
import {FontScaleService} from '../../_services/font-scale.service';
import {IItem} from '../../_interfaces/annot-json.interface';
import {EmuWebappTheme} from '../../_interfaces/emu-webapp-theme.interface';

export function drawEvent(context: CanvasRenderingContext2D,
                          item: IItem,
                          attribute: string,
                          viewportStartSample: number,
                          viewportEndSample: number,
                          drawSmallVersion: boolean,
                          emuWebappTheme: EmuWebappTheme) {

    const labelValue = LevelService.getLabelByAttribute(item, attribute);

    const position = getCanvasCoordinateOfSample(
        item.samplePoint,
        viewportStartSample,
        viewportEndSample,
        context.canvas.width
    ).center;

    context.fillStyle = emuWebappTheme.primaryLineColor;
    context.fillRect(position, 0, 1, context.canvas.height / 2 - context.canvas.height / 5);
    context.fillRect(position, context.canvas.height / 2 + context.canvas.height / 5, 1, context.canvas.height / 2 - context.canvas.height / 5);

    FontScaleService.drawUndistortedText(
        context,
        labelValue,
        emuWebappTheme.primaryFontSize - 2,
        emuWebappTheme.primaryFontFamily,
        position,
        context.canvas.height / 2,
        emuWebappTheme.primaryFontColor,
        'center',
        'middle'
    );

    if (!drawSmallVersion) {
        FontScaleService.drawUndistortedText(
            context,
            item.samplePoint.toString(),
            emuWebappTheme.primaryFontSize - 2,
            emuWebappTheme.primaryFontFamily,
            position + 5,
            0,
            emuWebappTheme.secondaryFontColor,
            'left',
            'top'
        );
    }
}
