import { Injectable } from '@angular/core';


declare global{
  interface Window {
    AudioContext: any;
    webkitAudioContext: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SoundHandlerService {

  constructor() { }

  // private vars
  private audioContext;
  private curSource;

  // public vars
  public audioBuffer: any = {};
  public isPlaying = false;

  ///////////////////////////////////////////
  // private API

  /**
   * safely initialize audio context
   * */
  private initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      alert('Error loading the AudioContext (could mean your browser does not support the HTML5 webaudio API):' + e);
    }
  }

  ///////////////////////////////////////////
  // public API

  /**
   * decode and play a passed in buffer
   *
   * */
  decodeAndPlay(sampleStart, endSample) {
    if (typeof(this.audioContext) === 'undefined') {
      this.initAudioContext();
    }

    let startTime = sampleStart / this.audioBuffer.sampleRate;
    let endTime = endSample / this.audioBuffer.sampleRate;
    let durTime = endTime - startTime;


    this.curSource = this.audioContext.createBufferSource();
    this.curSource.buffer = this.audioBuffer;
    this.curSource.connect(this.audioContext.destination);
    this.curSource.start(0, startTime, durTime);
    this.curSource.onended = function () {
      this.isPlaying = false;
    };

  }


  // /**
  //  * Creates new ArrayBuffer containing wav file that goes
  //  * from sampleStart to endSample
  //  *
  //  * @param sampleStart number that represents start sample
  //  * @paramn endSample number that represents end sample
  //  * @returns ArrayBuffer containing wav file
  //  * */
  // // sServObj.extractRelPartOfWav = function (sampleStart, endSample) {
  // // 	var bytePerSample = sServObj.wavJSO.BitsPerSample / 8;
  // // 	var headerSize = 44;
  // // 	if(sServObj.wavJSO.Subchunk1Size == 18){
  // // 		headerSize = 46;
  // // 	}
  // //
  // // 	var header = sServObj.wavJSO.origArrBuf.subarray(0, headerSize);
  // // 	var data = sServObj.wavJSO.origArrBuf.subarray(headerSize, sServObj.wavJSO.Data.length * bytePerSample);
  // //
  // // 	var dv = new DataView(header);
  // // 	var Subchunk2SizePos = 40;
  // // 	if(sServObj.wavJSO.Subchunk1Size == 18){
  // // 		Subchunk2SizePos = 42;
  // // 	}
  // // 	dv.setUint32(Subchunk2SizePos, (endSample - sampleStart) * bytePerSample, true);
  // // 	// var Subchunk2Size = dv.getUint32(40, true);
  // // 	// console.log(Subchunk2Size);
  // //
  // // 	var newData = data.subarray(sampleStart * bytePerSample, (endSample - sampleStart) * bytePerSample);
  // //
  // // 	var tmp = new Uint8Array(header.byteLength + newData.byteLength);
  // // 	tmp.set(new Uint8Array(header), 0);
  // // 	tmp.set(new Uint8Array(newData), header.byteLength);
  // //
  // // 	return (tmp.buffer);
  // // };

  /**
   * play audio from to specified in samples
   *
   * @param sampleStart number that represents start sample
   * @param endSample number that represents end sample
   * */
  playFromTo(sampleStart, endSample) {

    //var cutWavBuff = this.extractRelPartOfWav(sampleStart, endSample);

    if (this.isPlaying) {
      this.isPlaying = false;
      this.curSource.stop(0);
    } else {

      this.isPlaying = true;
      if (this.audioBuffer.length > 0) { // if wav file is not empty
        this.decodeAndPlay(sampleStart, endSample);
      }
    }

  }


}
