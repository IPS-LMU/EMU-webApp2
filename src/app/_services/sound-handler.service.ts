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
  public isPlaying: boolean = false;

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

  /**
   * play audio from to specified in samples
   *
   * @param sampleStart number that represents start sample
   * @param endSample number that represents end sample
   * */
  playFromTo(sampleStart, endSample) {

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
