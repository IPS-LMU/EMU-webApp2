import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ArrayBufferHelperService } from './array-buffer-helper.service'


declare global{
  interface Window {
    OfflineAudioContext: any;
    webkitOfflineAudioContext: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WavParserService {

  constructor() { }

  // var defer;
  //
  /**
   * convert binary values to strings
   * (currently duplicate of function in wavParserWorkerClass)
   * SIC this should be in an external service shouldn't it?
   * @param ab array buffer containing string binary values
   */
  ab2str(ab) {
    let unis = [];
    for (let i = 0; i < ab.length; i++) {
      unis.push(ab[i]);
    }
    return String.fromCharCode.apply(null, unis);
  }


  /**
   * parse header of wav file
   * (currently duplicate of function in wavParserWorkerClass)
   * @param buf array buffer containing entire wav file
   */
  parseWavHeader(buf){

    let headerInfos:any = {};

    let curBinIdx, curBuffer, curBufferView;

    // ChunkId == RIFF CHECK
    curBinIdx = 0;
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint8Array(curBuffer);
    headerInfos.ChunkID = this.ab2str(curBufferView);

    if (headerInfos.ChunkID !== 'RIFF') {
      // console.error('Wav read error: ChunkID not RIFF. Got ' + headerInfos.ChunkID);
      return ({
        'status': {
          'type': 'ERROR',
          'message': 'Wav read error: ChunkID not RIFF but ' + headerInfos.ChunkID
        }
      });
    }


    // ChunkSize
    curBinIdx = 4;
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint32Array(curBuffer);
    headerInfos.ChunkSize = curBufferView[0];

    // Format == WAVE CHECK
    curBinIdx = 8;
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint8Array(curBuffer);
    headerInfos.Format = this.ab2str(curBufferView);
    if (headerInfos.Format !== 'WAVE') {
      // console.error('Wav read error: Format not WAVE. Got ' + headerInfos.Format);
      return ({
        'status': {
          'type': 'ERROR',
          'message': 'Wav read error: Format not WAVE but ' + headerInfos.Format
        }
      });
    }

    // look for 'fmt ' sub-chunk as described here: http://soundfile.sapp.org/doc/WaveFormat/
    let foundChunk = false;
    let fmtBinIdx = 12; // 12 if first sub-chunk
    while(!foundChunk){
      curBuffer = ArrayBufferHelperService.subarray(buf, fmtBinIdx, 4);
      curBufferView = new Uint8Array(curBuffer);
      let cur4chars = this.ab2str(curBufferView);
      if(cur4chars === 'fmt '){
        // console.log('found fmt chunk at' + fmtBinIdx);
        headerInfos.FmtSubchunkID = 'fmt ';
        foundChunk = true;

      }else{
        fmtBinIdx += 1;
      }
      if(cur4chars === 'data'){
        return ({
          'status': {
            'type': 'ERROR',
            'message': 'Wav read error: Reached end of header by reaching data sub-chunk without finding "fmt " sub-chunk   '
          }
        });
      }

    }

    // FmtSubchunkSize parsing
    curBinIdx = fmtBinIdx + 4; // 16
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint32Array(curBuffer);
    headerInfos.FmtSubchunkSize = curBufferView[0];

    // AudioFormat == 1  CHECK
    curBinIdx = fmtBinIdx + 8; // 20
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 2);
    curBufferView = new Uint16Array(curBuffer);
    headerInfos.AudioFormat = curBufferView[0];
    if ([0, 1].indexOf(headerInfos.AudioFormat) === -1) {
      // console.error('Wav read error: AudioFormat not 1');
      return ({
        'status': {
          'type': 'ERROR',
          'message': 'Wav read error: AudioFormat not 0 or 1 but ' + headerInfos.AudioFormat
        }
      });
    }

    // NumChannels == 1  CHECK
    curBinIdx = fmtBinIdx + 10; // 22
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 2);
    curBufferView = new Uint16Array(curBuffer);
    headerInfos.NumChannels = curBufferView[0];
    if (headerInfos.NumChannels < 1) {
      return ({
        'status': {
          'type': 'ERROR',
          'message': 'Wav read error: NumChannels not greater than 1 but ' + headerInfos.NumChannels
        }
      });
    }

    // SampleRate
    curBinIdx = fmtBinIdx + 12; // 24
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint32Array(curBuffer);
    headerInfos.SampleRate = curBufferView[0];

    // ByteRate
    curBinIdx = fmtBinIdx + 16; // 28
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 4);
    curBufferView = new Uint32Array(curBuffer);
    headerInfos.ByteRate = curBufferView[0];

    // BlockAlign
    curBinIdx = fmtBinIdx + 20; // 32
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 2);
    curBufferView = new Uint16Array(curBuffer);
    headerInfos.BlockAlign = curBufferView[0];

    // BitsPerSample
    curBinIdx = fmtBinIdx + 12; // 34
    curBuffer = ArrayBufferHelperService.subarray(buf, curBinIdx, 2);
    curBufferView = new Uint16Array(curBuffer);
    headerInfos.BitsPerSample = curBufferView[0];

    // console.log(headerInfos);

    // look for data chunk size
    foundChunk = false;
    let dataBinIdx = fmtBinIdx + 14; // 36
    while(!foundChunk){
      curBuffer = ArrayBufferHelperService.subarray(buf, dataBinIdx, 4);
      curBufferView = new Uint8Array(curBuffer);
      let cur4chars = this.ab2str(curBufferView);
      if(cur4chars === 'data'){
        foundChunk = true;
        curBuffer = ArrayBufferHelperService.subarray(buf, dataBinIdx + 4, 4);
        curBufferView = new Uint32Array(curBuffer);
        headerInfos.dataChunkSize = curBufferView[0];
      }else{
        dataBinIdx += 1;
      }
    }

    return headerInfos;

  }


  /**
   * parse buffer containing wav file using webworker
   * @param buf
   * @returns promise
   */
  parseWavAudioBuf(buf) {
    let headerInfos = this.parseWavHeader(buf);
    if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
    //   defer = $q.defer();
    //   defer.reject(headerInfos); // headerInfos now contains only error message
    //   return defer.promise;
    }else{
      try {
        // console.log(headerInfos)
        let offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
          headerInfos.NumChannels,
          headerInfos.dataChunkSize / headerInfos.NumChannels / (headerInfos.BitsPerSample / 8),
          headerInfos.SampleRate);
        let subj = new Subject();

        offlineCtx.decodeAudioData(buf, (audio_buffer) => {
          subj.next(audio_buffer);
        }, (err) => {
          subj.error(err);
        });
        return subj;
      }catch (e){
    //     // construct error object
    //     var errObj = {};
    //     errObj.exception = JSON.stringify(e, null, 4);
    //     errObj.EMUwebAppComment = 'This could be because you are using Safari and the sample rate is unequal to 44100; 48000 or 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext in Safari';
    //
    //     var err = {};
    //     err.status = {};
    //     err.status.message = JSON.stringify(errObj, null, 4);
    //
    //     defer = $q.defer();
    //     defer.reject(err); // headerInfos now contains only error message
    //     return defer.promise;
    //
      }

    }

  }

}
