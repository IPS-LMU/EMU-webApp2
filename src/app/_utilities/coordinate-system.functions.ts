export function getCanvasCoordinateOfSample(targetSample: number,
                                            viewportStartSample: number,
                                            viewportEndSample: number,
                                            canvasWidth: number): { start: number, center: number, end: number } {
    const numberOfSamplesInViewport = viewportEndSample - viewportStartSample + 1;
    const sampleWidth = canvasWidth / numberOfSamplesInViewport;
    const targetSampleRelativeToViewport = targetSample - viewportStartSample;

    const pixelPositionOfSampleStart = targetSampleRelativeToViewport * sampleWidth;
    const pixelPositionOfSampleCenter = pixelPositionOfSampleStart + sampleWidth / 2;
    const pixelPositionOfSampleEnd = pixelPositionOfSampleStart + sampleWidth;

    return {
        start: Math.round(pixelPositionOfSampleStart),
        center: Math.round(pixelPositionOfSampleCenter),
        end: Math.round(pixelPositionOfSampleEnd)
    };
}

export function getTimeOfSample(targetSample: number,
                                sampleRate: number): { start: number, center: number, end: number } {
    let startOfSample = (targetSample - 0.5) / sampleRate;
    const centerOfSample = targetSample / sampleRate;
    const endOfSample = (targetSample + 0.5) / sampleRate;

    if (targetSample === 0) {
        startOfSample = 0;
    }

    return {
        start: startOfSample,
        center: centerOfSample,
        end: endOfSample
    };
}

export function getSampleAtCanvasCoordinate(canvasCoordinate: number,
                                            viewportStartSample: number,
                                            viewportEndSample: number,
                                            canvasWidth: number): number {
    const numberOfSamplesInViewport = viewportEndSample - viewportStartSample + 1;
    const relativePosition = canvasCoordinate / canvasWidth;
    return viewportStartSample + Math.floor(numberOfSamplesInViewport * relativePosition);
}

export function getSamplesPerCanvasPixel(viewportStartSample: number,
                                         viewportEndSample: number,
                                         canvas: HTMLCanvasElement) {
    const numberOfSamplesInViewport = viewportEndSample - viewportStartSample + 1;
    return numberOfSamplesInViewport / canvas.width;
}

export function getSamplesPerCssPixel(viewportStartSample: number,
                                      viewportEndSample: number,
                                      canvas: HTMLCanvasElement) {
    const numberOfSamplesInViewport = viewportEndSample - viewportStartSample + 1;
    return numberOfSamplesInViewport / canvas.clientWidth;
}

export function getMousePositionInCanvasX(event: MouseEvent) {
    const target: HTMLCanvasElement = event.target as HTMLCanvasElement;
    return (event.offsetX || (event as any).layerX) * (target.width / target.clientWidth);
}

export function getMousePositionInCanvasY(event: MouseEvent) {
    const target: HTMLCanvasElement = event.target as HTMLCanvasElement;
    return (event.offsetY || (event as any).layerY) * (target.height / target.clientHeight);
}


export function getSampleNumberAtCanvasMouseEvent(event: MouseEvent,
                                                  viewportStartSample: number,
                                                  viewportEndSample: number) {
    const positionInCanvasCoordinates = getMousePositionInCanvasX(event);

    return getSampleAtCanvasCoordinate(
        positionInCanvasCoordinates,
        viewportStartSample,
        viewportEndSample,
        (event.target as HTMLCanvasElement).width
    );
}
