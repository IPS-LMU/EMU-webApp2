export function adjustSelection(newBoundary: number,
                                selectionStartSample: number,
                                selectionEndSample: number): {start: number, end: number} {
    const distanceToStartOfSelection = Math.abs(newBoundary - selectionStartSample);
    const distanceToEndOfSelection = Math.abs(newBoundary - selectionEndSample);

    if (selectionStartSample === selectionEndSample) {
        if (newBoundary < selectionStartSample) {
            return {start: newBoundary, end: selectionEndSample};
        } else {
            return {start: selectionStartSample, end: newBoundary};
        }
    } else if (distanceToEndOfSelection > distanceToStartOfSelection) {
        return {start: newBoundary, end: selectionEndSample};
    } else {
        return {start: selectionStartSample, end: newBoundary};
    }
}
