/**
 * get pixel position of a certain sample in current viewport, given the canvas width
 * @param sample is current sample to convert to pixel value
 * @param canvasWidth is width of canvas
 */
export function getPixelPositionOfSampleInViewport(sample: number,
                                                   viewportStartSample: number,
                                                   viewportEndSample: number,
                                                   canvasWidth: number): number {
    return (canvasWidth * (sample - viewportStartSample) / (viewportEndSample - viewportStartSample + 1));
    // + 1 because of view (displays all samples in view)
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

export function getSamplesPerPixelInViewport(viewportStartSample: number,
                                             viewportEndSample: number,
                                             canvas: HTMLCanvasElement) {
    return (viewportEndSample - viewportStartSample) / canvas.width;
}

export function getSampleNumberAtCanvasMouseEvent(event: MouseEvent,
                                                  viewportStartSample: number,
                                                  viewportEndSample: number) {
    return viewportStartSample + getMousePositionInCanvasX(event) * getSamplesPerPixelInViewport(
        viewportStartSample,
        viewportEndSample,
        event.target as HTMLCanvasElement
    );
}

export function calculateSampleTime(sample: number, sampleRate: number): number {
    return (sample + 0.5) / sampleRate;
}
