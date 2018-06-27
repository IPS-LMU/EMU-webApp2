import {WindowType} from './window-type.type';

export interface SpectrogramSettings {
    windowSizeInSecs: number;
    rangeFrom: number; // integer
    rangeTo: number; // integer
    dynamicRange: number; // integer
    window: WindowType;
    preEmphasisFilterFactor: number;
    transparency: number; // integer, 0 - 255
    drawHeatMapColors: boolean;
    heatMapColorAnchors: number[][]; // integer[][], 0 - 255, the inner array needs exactly 3 items
}
