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

/**
 * calculate the pixel distance between two samples
 */
export function getPixelDistanceBetweenSamples(viewportStartSample: number,
                                               viewportEndSample: number,
                                               canvasWidth: number): number {
    return (canvasWidth / (viewportEndSample - viewportStartSample + 1));
}
