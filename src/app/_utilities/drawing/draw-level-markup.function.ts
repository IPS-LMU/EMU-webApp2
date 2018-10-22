import {DrawHelperService} from '../../_services/draw-helper.service';
import {IItem, ILevel} from '../../_interfaces/annot-json.interface';
import {getPixelDistanceBetweenSamples, getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {PreselectedItemInfo} from '../../_interfaces/preselected-item-info.interface';

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
                                movingBoundaryPosition: number,
                                audioBuffer: AudioBuffer,
                                mouseoverLevel: ILevel) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (selected) {
        ctx.fillStyle = 'rgba(22, 22, 22, 0.1)'; //this.config_provider_service.design.color.transparent.grey;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // draw moving boundary line if moving
    if (movingBoundaryPosition) {
        DrawHelperService.drawMovingBoundaryLine(
            ctx,
            viewportStartSample,
            viewportEndSample,
            movingBoundaryPosition,
            preselectedItem.isLast,
            mouseoverLevel
        );
    }

    // draw current viewport selected
    DrawHelperService.drawCurViewPortSelected(
        ctx,
        false,
        viewportStartSample,
        viewportEndSample,
        selectionStartSample,
        selectionEndSample,
        audioBuffer,
        mouseoverLevel,
        'white',
        'white',
        'rgba(255, 255, 255, 0.3)'
    );


    let posS, posE, sDist, xOffset;
    posS = getPixelPositionOfSampleInViewport(
        selectionStartSample,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    );
    posE = getPixelPositionOfSampleInViewport(
        selectionEndSample,
        viewportStartSample,
        viewportEndSample,
        ctx.canvas.width
    );
    sDist = getPixelDistanceBetweenSamples(viewportStartSample, viewportEndSample, ctx.canvas.width);


    if (selectedItems !== undefined) {
        // draw clicked on selected areas
        if (selected && selectedItems.length > 0) {
            for (let item of selectedItems) {
                if (item !== undefined) {
                    // check if segment or event level
                    if (item.sampleStart !== undefined) {
                        posS = Math.round(getPixelPositionOfSampleInViewport(
                            item.sampleStart,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ));
                        posE = Math.round(getPixelPositionOfSampleInViewport(
                            item.sampleStart + item.sampleDur + 1,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ));
                    } else {
                        posS = Math.round(getPixelPositionOfSampleInViewport(
                            item.samplePoint,
                            viewportStartSample,
                            viewportEndSample,
                            ctx.canvas.width
                        ) + sDist / 2);
                        posS = posS - 5;
                        posE = posS + 10;
                    }
                    ctx.fillStyle = 'rgba(255, 255, 22, 0.35)';//this.config_provider_service.design.color.transparent.yellow;
                    ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
                    ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
                }
            }
        }
    }


    // draw preselected boundary

    if (level.items.length > 0 && preselectedItem && level.name === mouseoverLevel.name) {
        let item = preselectedItem.item;
        ctx.fillStyle = '#4fc3f7'; //this.config_provider_service.design.color.blue;
        if (preselectedItem.isFirst === true) { // before first segment
            if (level.type === 'SEGMENT') {
                item = level.items[0]; // @todo this is superfluous
                posS = Math.round(getPixelPositionOfSampleInViewport(
                    item.sampleStart,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ));
                ctx.fillRect(posS, 0, 3, ctx.canvas.height);
            }
        } else if (preselectedItem.isLast === true) { // after last segment
            if (level.type === 'SEGMENT') {
                item = level.items[level.items.length - 1];
                posS = Math.round(getPixelPositionOfSampleInViewport(
                    item.sampleStart + item.sampleDur + 1, // +1 because boundaries are drawn on sampleStart
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ));
                ctx.fillRect(posS, 0, 3, ctx.canvas.height);
            }
        } else { // in the middle
            if (level.type === 'SEGMENT') {
                posS = Math.round(getPixelPositionOfSampleInViewport(
                    item.sampleStart,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ));
                ctx.fillRect(posS, 0, 3, ctx.canvas.height);
            } else {
                posS = Math.round(getPixelPositionOfSampleInViewport(
                    item.samplePoint,
                    viewportStartSample,
                    viewportEndSample,
                    ctx.canvas.width
                ));
                xOffset = (sDist / 2);
                ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);

            }
        }
        ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;

    }

    // draw cursor
    DrawHelperService.drawCrossHairX(ctx, crosshairPosition);
}
