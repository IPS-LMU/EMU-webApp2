import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';

export function drawVerticalCrossHair(context: CanvasRenderingContext2D,
                                      mouseX: number,
                                      emuWebappTheme: EmuWebappTheme) {
    if (mouseX === null) {
        return;
    }
    context.strokeStyle = emuWebappTheme.crossHairColor;
    context.beginPath();
    context.moveTo(mouseX, 0);
    context.lineTo(mouseX, context.canvas.height);
    context.stroke();
}
