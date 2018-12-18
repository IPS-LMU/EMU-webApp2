import {Boundary} from '../../../_interfaces/boundary.interface';
import {getCanvasCoordinateOfSample} from '../../coordinate-system.functions';
import {EmuWebappTheme} from '../../../_interfaces/emu-webapp-theme.interface';

export function drawMovingBoundaryLines(context: CanvasRenderingContext2D,
                                        viewportStartSample: number,
                                        viewportEndSample: number,
                                        movingBoundaries: Boundary[],
                                        emuWebappTheme: EmuWebappTheme) {
    context.fillStyle = emuWebappTheme.movingBoundaryLineColor;

    for (const movingBoundary of movingBoundaries) {

        const x = getCanvasCoordinateOfSample(
            movingBoundary.sample,
            viewportStartSample,
            viewportEndSample,
            context.canvas.width
        )[movingBoundary.positionInSample];

        context.fillRect(x, 0, 1, context.canvas.height);
    }
}
