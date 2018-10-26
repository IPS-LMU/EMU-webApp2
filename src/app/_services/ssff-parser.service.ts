import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SsffParserService {

  private worker;
  private subj; // use subject for defers

  constructor() {
    let workerFunctionBlob = new Blob(['(' + this.workerFunction.toString() + ')();'], {type: 'text/javascript'});
    let workerFunctionURL = window.URL.createObjectURL(workerFunctionBlob);
    this.worker = new Worker(workerFunctionURL);

    // add event listener to worker to respond to messages
    this.worker.onmessage = (mesg) => {
      // console.log("gotmessage from worker: ", mesg);
      if (mesg.data.status.type === 'SUCCESS') {
        this.subj.next(mesg.data);
      } else {
        this.subj.reject(mesg.data);
      }
    };

  }

  workerFunction() {
    let selfAny = <any>self;
    selfAny.ssffData = {};
    selfAny.headID = 'SSFF -- (c) SHLRC\n';
    selfAny.machineID = 'Machine IBM-PC\n';
    selfAny.sepString = '-----------------\n';
    selfAny.ssffData.fileExtension = '';
    selfAny.ssffData.sampleRate = -1;
    selfAny.ssffData.startTime = -1;
    selfAny.ssffData.origFreq = -1;
    selfAny.ssffData.Columns = [];

    // /*
    // * duplicate of function in array-buffer-helper
    // */
    //
    // selfAny.subarray = function(ab, offset, length){
    //   let sub = new ArrayBuffer(length);
    //   let subView = new Int8Array(sub);
    //   let thisView = new Int8Array(ab);
    //   for (let i = 0; i < length; i++) {
    //     subView[i] = thisView[offset + i];
    //   }
    //   return sub;
    // };

    // /**
    //  * Mock for atob btoa for web kit based browsers that don't support these in webworkers
    //  */
    // (function () {
    //   var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    //   var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    //     52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    //     15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    //     41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    //
    //   function base64encode(str) {
    //     var out, i, len;
    //     var c1, c2, c3;
    //
    //     len = str.length;
    //     i = 0;
    //     out = '';
    //     while (i < len) {
    //       c1 = str.charCodeAt(i++) & 0xff;
    //       if (i === len) {
    //         out += base64EncodeChars.charAt(c1 >> 2);
    //         out += base64EncodeChars.charAt((c1 & 0x3) << 4);
    //         out += '==';
    //         break;
    //       }
    //       c2 = str.charCodeAt(i++);
    //       if (i === len) {
    //         out += base64EncodeChars.charAt(c1 >> 2);
    //         out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    //         out += base64EncodeChars.charAt((c2 & 0xF) << 2);
    //         out += '=';
    //         break;
    //       }
    //       c3 = str.charCodeAt(i++);
    //       out += base64EncodeChars.charAt(c1 >> 2);
    //       out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    //       out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    //       out += base64EncodeChars.charAt(c3 & 0x3F);
    //     }
    //     return out;
    //   }
    //
    //   function base64decode(str) {
    //     var c1, c2, c3, c4;
    //     var i, len, out;
    //
    //     len = str.length;
    //     i = 0;
    //     out = '';
    //     while (i < len) {
    //       do {
    //         c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    //       } while (i < len && c1 === -1);
    //       if (c1 === -1) {
    //         break;
    //       }
    //       do {
    //         c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    //       } while (i < len && c2 === -1);
    //       if (c2 === -1) {
    //         break;
    //       }
    //       out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
    //
    //       do {
    //         c3 = str.charCodeAt(i++) & 0xff;
    //         if (c3 === 61) {
    //           return out;
    //         }
    //         c3 = base64DecodeChars[c3];
    //       } while (i < len && c3 === -1);
    //       if (c3 === -1) {
    //         break;
    //       }
    //       out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
    //       do {
    //         c4 = str.charCodeAt(i++) & 0xff;
    //         if (c4 === 61) {
    //           return out;
    //         }
    //         c4 = base64DecodeChars[c4];
    //       } while (i < len && c4 === -1);
    //       if (c4 === -1) {
    //         break;
    //       }
    //       out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    //     }
    //     return out;
    //   }
    //
    //   //var scope = (typeof window !== 'undefined') ? window : global;
    //   if (!global.btoa) {
    //     global.btoa = base64encode;
    //   }
    //   if (!global.atob) {
    //     global.atob = base64decode;
    //   }
    // })();

    /**
     *
     */
    selfAny.base64ToArrayBuffer = function (stringBase64) {
      let binaryString = selfAny.atob(stringBase64);
      let len = binaryString.length;
      let bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        let ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
      }
      return bytes.buffer;
    };

    /**
     * round to n decimal digits after the comma
     * used to help display numbers with a given
     * precision
     */
    selfAny.round = function (x, n) {
      if (n < 1 || n > 14) {
        return false;
      }
      let e = Math.pow(10, n);
      let k = (Math.round(x * e) / e).toString();
      if (k.indexOf('.') === -1) {
        k += '.';
      }
      k += e.toString().substring(1);
      return k.substring(0, k.indexOf('.') + n + 1);
    };

    /**
     * helper function to convert string to Uint8Array
     * @param string
     */
    selfAny.stringToUint = function (string) {
      let charList = string.split('');
      let uintArray = [];
      for (let i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
      }
      return new Uint8Array(uintArray);
    };

    /**
     *
     */
    selfAny.Uint8Concat = function (first, second) {
      let firstLength = first.length;
      let result = new Uint8Array(firstLength + second.length);

      result.set(first);
      result.set(second, firstLength);

      return result;
    };

    /**
     * convert arraybuffer containing a ssff file
     * to a javascript object
     * @param buf arraybuffer containing ssff file
     * @param name is fileExtension
     * @returns ssff javascript object
     */
    selfAny.ssff2jso = function (buf, name) {

      selfAny.ssffData.fileExtension = name;
      selfAny.ssffData.Columns = [];
      // console.log('SSFF loaded');

      let uIntBuffView = new Uint8Array(buf);
      let dataView = new DataView(buf);

      // Causes 'RangeError: Maximum call stack size exceeded'
      // with some browsers (?)(Chrome/Chromium on Ubuntu)
      //var buffStr = String.fromCharCode.apply(null, uIntBuffView);
      let buffStr = '';
      // if ('TextDecoder' in this) {
      //   let decoder = new TextDecoder('ASCII');
      //   buffStr = decoder.decode(dataView);
      //   //var headerStr = buffStr.split(sepString)[0];
      //   //var dataStr = buffStr.split(sepString)[1];
      //   //console.log(dataStr);
      // } else {
        for (let j = 0; j < uIntBuffView.length; j++) {
          buffStr = buffStr + String.fromCharCode(uIntBuffView[j]);
        }
      // }

      let newLsep = buffStr.split(/^/m);

      //check if header has headID and machineID
      if (newLsep[0] !== selfAny.headID) {
        // alert('SSFF parse error: first line != SSFF -- (c) SHLRC');
        return ({
          'status': {
            'type': 'ERROR',
            'message': 'SSFF parse error: first line != SSFF -- (c) SHLRC in file with fileExtension ' + name
          }
        });
      }
      if (newLsep[1] !== selfAny.machineID) {
        // alert('SSFF parse error: machineID != Machine IBM-PC');
        return ({
          'status': {
            'type': 'ERROR',
            'message': 'SSFF parse error: machineID != Machine IBM-PC in file with fileExtension ' + name
          }
        });
      }

      // search header for Record_Freq and Start_Time
      selfAny.ssffData.sampleRate = undefined;
      selfAny.ssffData.startTime = undefined;
      let counter = 0;
      while (newLsep[counter] !== selfAny.sepString) {
        if (newLsep[counter].split(/[ ,]+/)[0] === 'Record_Freq') {
          // console.log('FOUND Record_Freq')
          selfAny.ssffData.sampleRate = parseFloat(newLsep[counter].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ''));
        }
        if (newLsep[counter].split(/[ ,]+/)[0] === 'Start_Time') {
          // console.log('FOUND Start_Time')
          selfAny.ssffData.startTime = parseFloat(newLsep[counter].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ''));
        }
        counter += 1;
      }

      // check if found Record_Freq and Start_Time
      if (selfAny.ssffData.sampleRate === undefined || selfAny.ssffData.startTime === undefined) {
        // alert('SSFF parse error: Required fields Record_Freq or Start_Time not set!');
        return ({
          'status': {
            'type': 'ERROR',
            'message': 'SSFF parse error: Required fields Record_Freq or Start_Time not set in file with fileExtension ' + name
          }
        });
      }

      let headerLineSize;
      for (let i = 4; i < newLsep.length; i++) {
        if (newLsep[i].split(/[ ,]+/)[0] === 'Original_Freq') {
          selfAny.ssffData.origFreq = parseFloat(newLsep[i].split(/[ ,]+/)[2].replace(/(\r\n|\n|\r)/gm, ''));
        }
        if (newLsep[i] === selfAny.sepString) {
          headerLineSize = i;
          break;
        }
        let lSpl = newLsep[i].split(/[ ]+/);

        if (lSpl[0] === 'Column') {
          selfAny.ssffData.Columns.push({
            'name': lSpl[1],
            'ssffdatatype': lSpl[2],
            'length': parseInt(lSpl[3].replace(/(\r\n|\n|\r)/gm, ''), 10),
            'values': [],
            '_minVal': Infinity,
            '_maxVal': -Infinity
          });
        }
      }

      // console.log(newLsep.slice(0, headerLineSize + 1).join(''));
      let curBinIdx = newLsep.slice(0, headerLineSize + 1).join('').length; // i + 1 exchanged for headerLineSize + 1

      let curBufferView, curBuffer, curLen, curMin, curMax;
      // console.log('in ssff2jso curBinIdx:', curBinIdx, '; uIntBuffView.length: ', uIntBuffView.length);
      while (curBinIdx < uIntBuffView.length) {
        // console.log("curBinIdx", curBinIdx);
        for (let i = 0; i < selfAny.ssffData.Columns.length; i++) {

          // console.log("coltype", selfAny.ssffData.Columns[i].ssffdatatype);
          if (selfAny.ssffData.Columns[i].ssffdatatype === 'DOUBLE') {
            curLen = 8 * selfAny.ssffData.Columns[i].length;
            curBuffer = buf.slice(curBinIdx, curBinIdx + curLen);
            // ugly hack in order to support PhantomJS < 2.0 testing
            // if (typeof Float64Array === 'undefined') {
            //   Float64Array = Float32Array;
            // }
            curBufferView = new Float64Array(curBuffer);
            selfAny.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
            curBinIdx += curLen;

            // set _minVal and _maxVal
            curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
            curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
            if (curMin < selfAny.ssffData.Columns[i]._minVal) {
              selfAny.ssffData.Columns[i]._minVal = curMin;
            }
            if (curMax > selfAny.ssffData.Columns[i]._maxVal) {
              selfAny.ssffData.Columns[i]._maxVal = curMax;
            }

          } else if (selfAny.ssffData.Columns[i].ssffdatatype === 'FLOAT') {
            curLen = 4 * selfAny.ssffData.Columns[i].length;
            curBuffer =  buf.slice(curBinIdx, curBinIdx + curLen);
            curBufferView = new Float32Array(curBuffer);
            selfAny.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
            curBinIdx += curLen;

            // set _minVal and _maxVal
            curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
            curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
            if (curMin < selfAny.ssffData.Columns[i]._minVal) {
              selfAny.ssffData.Columns[i]._minVal = curMin;
            }
            if (curMax > selfAny.ssffData.Columns[i]._maxVal) {
              selfAny.ssffData.Columns[i]._maxVal = curMax;
            }

          } else if (selfAny.ssffData.Columns[i].ssffdatatype === 'SHORT') {
            curLen = 2 * selfAny.ssffData.Columns[i].length;
            curBuffer = buf.slice(curBinIdx, curBinIdx + curLen);
            curBufferView = new Int16Array(curBuffer);
            selfAny.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
            curBinIdx += curLen;

            // set _minVal and _maxVal
            curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
            curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
            if (curMin < selfAny.ssffData.Columns[i]._minVal) {
              selfAny.ssffData.Columns[i]._minVal = curMin;
            }
            if (curMax > selfAny.ssffData.Columns[i]._maxVal) {
              selfAny.ssffData.Columns[i]._maxVal = curMax;
            }
          } else if (selfAny.ssffData.Columns[i].ssffdatatype === 'LONG') {
            curLen = 4 * selfAny.ssffData.Columns[i].length;
            curBuffer = buf.slice(curBinIdx, curBinIdx + curLen);

            curBufferView = new Int32Array(curBuffer);
            selfAny.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
            curBinIdx += curLen;

            // set _minVal and _maxVal
            curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
            curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
            if (curMin < selfAny.ssffData.Columns[i]._minVal) {
              selfAny.ssffData.Columns[i]._minVal = curMin;
            }
            if (curMax > selfAny.ssffData.Columns[i]._maxVal) {
              selfAny.ssffData.Columns[i]._maxVal = curMax;
            }

          } else if (selfAny.ssffData.Columns[i].ssffdatatype === 'BYTE') {
            curLen = 1 * selfAny.ssffData.Columns[i].length;
            curBuffer = buf.slice(curBinIdx, curBinIdx + curLen);
            curBufferView = new Uint8Array(curBuffer);
            selfAny.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
            curBinIdx += curLen;
          } else {
            // alert('Unsupported column type! Only DOUBLE, FLOAT, SHORT, BYTE column types are currently supported');
            return ({
              'status': {
                'type': 'ERROR',
                'message': 'Unsupported column type! Only DOUBLE, FLOAT, SHORT, BYTE column types are currently supported in file with fileExtension ' + name
              }
            });
          }
        // console.log(curBuffer);
        } //for
      } //while

      return selfAny.ssffData;

    };

    // /**
    //  * convert javascript object of label file to
    //  * array buffer containing
    //  * @param ssff javascipt object
    //  * @returns ssff arraybuffer
    //  */
    // global.jso2ssff = function (jso) {
    //   // create header
    //   var headerStr = headID + machineID;
    //   headerStr += 'Record_Freq ' + global.round(jso.sampleRate, 1) + '\n';
    //   headerStr += 'Start_Time ' + jso.startTime + '\n';
    //
    //   jso.Columns.forEach(function (col) {
    //     // console.log(col.name)
    //     headerStr += 'Column ' + col.name + ' ' + col.ssffdatatype + ' ' + col.length + '\n';
    //   });
    //
    //   headerStr += 'Original_Freq DOUBLE ' + global.round(jso.origFreq, 1) + '\n';
    //   headerStr += sepString;
    //
    //   // preallocate data buffer
    //   var bytePerTime = 0;
    //   var failed = false;
    //
    //   jso.Columns.forEach(function (col) {
    //     if (col.ssffdatatype === 'SHORT') {
    //       bytePerTime += 2 * col.length;
    //     } else {
    //       failed = true;
    //     }
    //   });
    //
    //   // check if failed
    //   if (failed) {
    //     return ({
    //       'status': {
    //         'type': 'ERROR',
    //         'message': 'Unsupported column type! Only SHORT columns supported for now!'
    //       }
    //     });
    //   }
    //
    //   var byteSizeOfDataBuffer = bytePerTime * jso.Columns[0].values.length;
    //
    //   var dataBuff = new ArrayBuffer(byteSizeOfDataBuffer);
    //   var dataBuffView = new DataView(dataBuff);
    //
    //   // convert buffer to header
    //   var ssffBufView = new Uint8Array(global.stringToUint(headerStr));
    //
    //   // loop through vals and append array of each column to ssffBufView
    //   var byteOffSet = 0;
    //   jso.Columns[0].values.forEach(function (curArray, curArrayIDX) {
    //     jso.Columns.forEach(function (curCol) {
    //       if (curCol.ssffdatatype === 'SHORT') {
    //         curCol.values[curArrayIDX].forEach(function (val) {
    //           dataBuffView.setInt16(byteOffSet, val, true);
    //           byteOffSet += 2;
    //         });
    //       } else {
    //         failed = true;
    //       }
    //     });
    //   });
    //
    //   // check if failed
    //   if (failed) {
    //     return ({
    //       'status': {
    //         'type': 'ERROR',
    //         'message': 'Unsupported column type! Only SHORT columns supported for now!'
    //       }
    //     });
    //   }
    //   // concatenate header with data
    //   var tmp = new Uint8Array(dataBuffView.buffer);
    //   ssffBufView = new global.Uint8Concat(ssffBufView, tmp);
    //   return ({
    //     'status': {
    //       'type': 'SUCCESS',
    //       'message': ''
    //     },
    //     'data': ssffBufView.buffer
    //   });
    // };

    /**
     * loop over ssff files in ssffArr and create a ssffJsoArr
     */
    selfAny.parseArr = function (ssffArr) {
      let noError = true;
      let resArr = [];
      let ssffJso;

      for (let i = 0; i < ssffArr.length; i++) {

        ssffJso = {};
        let arrBuff;
        arrBuff = selfAny.base64ToArrayBuffer(ssffArr[i].data);
        ssffJso = selfAny.ssff2jso(arrBuff, ssffArr[i].fileExtension);
        if (ssffJso.status === undefined) {
          resArr.push(JSON.parse(JSON.stringify(ssffJso))); // YUCK... don't know if SIC but YUCK!!!
        } else {
          noError = false;
          return ssffJso;
        }
      }
      if (noError) {
        return {
          'status': {
            'type': 'SUCCESS',
            'message': ''
          },
          'data': resArr
        };
      }
      else {
        return {
          'status': {
            'type': 'ERROR',
            'message': 'Error in parseArr() with: ' + JSON.stringify(ssffArr)
          }
        };
      }
    };


    selfAny.onmessage = function (msg) {
      // console.log("worker got message", msg);
      if (msg.data !== undefined) {
        switch (msg.data.cmd) {
          case 'parseArr':
            selfAny.postMessage(selfAny.parseArr(msg.data.ssffArr));
            break;
          case 'jso2ssff':
            // postMessage(global.jso2ssff(JSON.parse(msg.data.jso)));
            break;
          default:
            selfAny.postMessage({
              'status': {
                'type': 'ERROR',
                'message': 'Unknown command sent to SsffParserWorker'
              }
            });
            break;
        }
      }
      else {
        selfAny.postMessage({
          'status': {
            'type': 'ERROR',
            'message': 'Undefined message was sent to SsffParserWorker'
          }
        });
      }
    };
  }


  ///////////////////////////
  // public



  /**
   * parse array of ssff file using webworker
   * @param array of ssff files encoded as base64 stings
   * @returns promise
   */
  public asyncParseSsffArr(ssffArray) {
    this.subj = new Subject();
    this.worker.postMessage({
      'cmd': 'parseArr',
      'ssffArr': ssffArray
    }); // Send data to our worker.
    return this.subj;
  };


  /**
   * convert jso to ssff binary file using webworker
   * @param java script object of ssff file (internal rep)
   * @returns promise
   */
  public asyncJso2ssff(jso) {
    // defer = $q.defer();
    this.subj = new Subject();
    this.worker.postMessage({
      'cmd': 'jso2ssff',
      'jso': JSON.stringify(jso)
    }); // Send data to our worker.
    // return defer.promise;
  }

}
