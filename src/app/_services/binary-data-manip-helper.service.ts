import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BinaryDataManipHelperService {

  constructor() { }

  /**
   *
   */
base64ToArrayBuffer(stringBase64) {
    let binaryString = window.atob(stringBase64);
    let len = binaryString.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      let ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes.buffer;
  }

  // /**
  //  *
  //  */
  // sServObj.arrayBufferToBase64 = function (buffer) {
  //   var binary = '';
  //   var bytes = new Uint8Array(buffer);
  //   var len = bytes.byteLength;
  //   for (var i = 0; i < len; i++) {
  //     binary += String.fromCharCode(bytes[i]);
  //   }
  //   return window.btoa(binary);
  // };
  //
  // /**
  //  *
  //  sServObj.stringToArrayBuffer = function (str) {
	// 		var ab = new ArrayBuffer(str.length);
	// 		var view = new Uint8Array(ab);
	// 		for (var i = 0; i < str.length; ++i) {
	// 			view[i] = str.charCodeAt(i);
	// 		}
	// 		return ab;
	// 	};
  //  */
  //
  // return sServObj;

}
