import {IItem, ILevel} from '../../_interfaces/annot-json.interface';
import {getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {PreselectedItemInfo} from '../../_interfaces/preselected-item-info.interface';
import {Boundary} from '../../_interfaces/boundary.interface';
import {drawMovingBoundaryLines} from './markup-elements/draw-moving-boundary-lines.function';
import {drawSelection} from './markup-elements/draw-selection.function';
import {drawVerticalCrossHair} from './markup-elements/draw-vertical-cross-hair.function';

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
                                movingBoundaries: Boundary[],
                                audioBuffer: AudioBuffer,
                                mouseoverLevel: ILevel) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (selected) {
        ctx.fillStyle = 'rgba(22, 22, 22, 0.1)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    drawMovingBoundaryLines(
        ctx,
        viewportStartSample,
        viewportEndSample,
        movingBoundaries
    );

    drawSelection(
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
                        itemEndPosition = itemStartPosition + 11;
                    }
                    ctx.fillStyle = 'rgba(255, 255, 22, 0.35)';
                    ctx.fillRect(itemStartPosition, 0, itemEndPosition - itemStartPosition, ctx.canvas.height);
                    ctx.fillStyle = 'black';
                }
            }
        }
    }


    // draw preselected boundary

    if (preselectedItem && level.name === mouseoverLevel.name) {
        ctx.fillStyle = '#4fc3f7';
        const boundaryPosition = getPixelPositionOfSampleInViewport(
            preselectedItem.selectedBoundary.sample,
            viewportStartSample,
            viewportEndSample,
            ctx.canvas.width
        )[preselectedItem.selectedBoundary.positionInSample];
        ctx.fillRect(boundaryPosition - 1, 0, 3, ctx.canvas.height);
        ctx.fillStyle = 'black';
    }

    // draw cursor
    drawVerticalCrossHair(ctx, crosshairPosition);
}
