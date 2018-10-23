import {DrawHelperService} from '../../_services/draw-helper.service';
import {IItem, ILevel} from '../../_interfaces/annot-json.interface';
import {getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {PreselectedItemInfo} from '../../_interfaces/preselected-item-info.interface';
import {MovingBoundary} from '../../_interfaces/moving-boundary.interface';

export function drawLevelMarkup(ctx: CanvasRenderingContext2D,
                                level: ILevel,
                                viewportStartSample: number,
                                viewportEndSample: number,
                                selectionStartSample: number,
                                selectionEndSample: number,
                                selected: boolean,
                                selectedItems: IItem[],
                                preselectedItem: PreselectedItemInfo,
                                crosshairPosition: number,
                                movingBoundary: MovingBoundary,
                                audioBuffer: AudioBuffer,
                                mouseoverLevel: ILevel) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (selected) {
        ctx.fillStyle = 'rgba(22, 22, 22, 0.1)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (movingBoundary) {
        DrawHelperService.drawMovingBoundaryLine(
            ctx,
            viewportStartSample,
            viewportEndSample,
            movingBoundary
        );
    }

    DrawHelperService.drawCurViewPortSelected(
        ctx,
        false,
        viewportStartSample,
        viewportEndSample,
        selectionStartSample,
        selectionEndSample,
        audioBuffer,
        'white',
        'white',
        'rgba(255, 255, 255, 0.3)'
    );


    if (selectedItems !== undefined) {
        // draw clicked on selected areas
        if (selected && selectedItems.length > 0) {
            for (const item of selectedItems) {
                if (item !== undefined) {
                    let itemStartPosition;
                    let itemEndPosition;

                    // check if segment or event level
                    if (item.sampleStart !== undefined) {
                        itemStartPosition = getPixelPositionOfSampleInViewport(
                            item.sampleStart,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ).start;
                        itemEndPosition = getPixelPositionOfSampleInViewport(
                            item.sampleStart + item.sampleDur,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ).end;
                    } else {
                        itemStartPosition = getPixelPositionOfSampleInViewport(
                            item.samplePoint,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ).center;
                        itemStartPosition = itemStartPosition - 5;
                        itemEndPosition = itemStartPosition + 10;
                    }
                    ctx.fillStyle = 'rgba(255, 255, 22, 0.35)';
                    ctx.fillRect(itemStartPosition, 0, itemEndPosition - itemStartPosition, ctx.canvas.height);
                    ctx.fillStyle = 'black';
                }
            }
        }
    }


    // draw preselected boundary

    if (level.items.length > 0 && preselectedItem && level.name === mouseoverLevel.name) {
        let item = preselectedItem.item;
        ctx.fillStyle = '#4fc3f7';
        if (preselectedItem.isFirst === true) { // before first segment
            if (level.type === 'SEGMENT') {
                item = level.items[0]; // @todo this is superfluous
                const boundaryPosition = getPixelPositionOfSampleInViewport(
                    item.sampleStart,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ).start;
                ctx.fillRect(boundaryPosition - 1, 0, 3, ctx.canvas.height);
            }
        } else if (preselectedItem.isLast === true) { // after last segment
            if (level.type === 'SEGMENT') {
                item = level.items[level.items.length - 1];
                const boundaryPosition = getPixelPositionOfSampleInViewport(
                    item.sampleStart + item.sampleDur,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ).end;
                ctx.fillRect(boundaryPosition - 1, 0, 3, ctx.canvas.height);
            }
        } else { // in the middle
            if (level.type === 'SEGMENT') {
                const boundaryPosition = getPixelPositionOfSampleInViewport(
                    item.sampleStart,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ).start;
                ctx.fillRect(boundaryPosition - 1, 0, 3, ctx.canvas.height);
            } else {
                const boundaryPosition = getPixelPositionOfSampleInViewport(
                    item.samplePoint,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ).center;
                ctx.fillRect(boundaryPosition, 0, 3, ctx.canvas.height);
            }
        }
        ctx.fillStyle = 'black';
    }

    // draw cursor
    DrawHelperService.drawCrossHairX(ctx, crosshairPosition);
}
