export function getPixelPositionOfSampleInViewport(targetSample: number,
                                                   viewportStartSample: number,
                                                   viewportEndSample: number,
                                                   canvasWidth: number): {start: number, center: number, end: number} {
    const numberOfSamplesInViewport = viewportEndSample - viewportStartSample + 1;
    const sampleWidth = canvasWidth / numberOfSamplesInViewport;
    const targetSampleRelativeToViewport = targetSample - viewportStartSample;

    const pixelPositionOfSampleStart = Math.round(targetSampleRelativeToViewport * sampleWidth);
    const pixelPositionOfSampleCenter = pixelPositionOfSampleStart + Math.round(sampleWidth / 2);
    const pixelPositionOfSampleEnd = pixelPositionOfSampleStart + Math.round(sampleWidth);

    return {
        start: pixelPositionOfSampleStart,
        center: pixelPositionOfSampleCenter,
        end: pixelPositionOfSampleEnd
    };
}

export function getSampleAtPixelPositionInViewport(pixel: number,
                                                   viewportStartSample: number,
                                                   viewportEndSample: number,
                                                   canvasWidth: number): number {
    return viewportStartSample + (viewportEndSample - viewportStartSample) * (pixel / canvasWidth);
}


/**
 * calculate the pixel distance between two samples
 */
export function getPixelDistanceBetweenSamples(viewportStartSample: number,
                                               viewportEndSample: number,
                                               canvasWidth: number): number {
    return (canvasWidth / (viewportEndSample - viewportStartSample + 1));
}

export function getMousePositionInCanvasX(event: MouseEvent) {
    const target: HTMLCanvasElement = event.target as HTMLCanvasElement;
    return (event.offsetX || event.layerX) * (target.width / target.clientWidth);
}

export function getMousePositionInCanvasY(event: MouseEvent) {
    const target: HTMLCanvasElement = event.target as HTMLCanvasElement;
    return (event.offsetY || event.layerY) * (target.height / target.clientHeight);
}

export function getSamplesPerCanvasWidthUnit(viewportStartSample: number,
                                             viewportEndSample: number,
                                             canvas: HTMLCanvasElement) {
    return (viewportEndSample - viewportStartSample) / canvas.width;
}

export function getSamplesPerPixel(viewportStartSample: number,
                                   viewportEndSample: number,
                                   canvas: HTMLCanvasElement) {
    return (viewportEndSample - viewportStartSample) / canvas.clientWidth;
}

export function getSampleNumberAtCanvasMouseEvent(event: MouseEvent,
                                                  viewportStartSample: number,
                                                  viewportEndSample: number) {
    const position = getMousePositionInCanvasX(event);
    const samplesPerUnit = getSamplesPerCanvasWidthUnit(
        viewportStartSample,
        viewportEndSample,
        event.target as HTMLCanvasElement
    );
    return Math.round(viewportStartSample + position  * samplesPerUnit);
}

export function calculateSampleTime(sample: number, sampleRate: number): number {
    return (sample + 0.5) / sampleRate;
}
