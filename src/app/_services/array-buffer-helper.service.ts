export class ArrayBufferHelperService {
    public static subarray(ab, offset, length) {
        const sub = new ArrayBuffer(length);
        const subView = new Int8Array(sub);
        const thisView = new Int8Array(ab);
        for (let i = 0; i < length; i++) {
            subView[i] = thisView[offset + i];
        }
        return sub;
    }
}
