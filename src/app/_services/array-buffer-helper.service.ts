import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArrayBufferHelperService {

  constructor() { }

  /*
  *
  */
  public subarray(ab, offset, length){
    let sub = new ArrayBuffer(length);
    let subView = new Int8Array(sub);
    let thisView = new Int8Array(ab);
    for (let i = 0; i < length; i++) {
      subView[i] = thisView[offset + i];
    }
    return sub;
  }

}
