import { Injectable } from '@angular/core';

import { ConfigProviderService } from './config-provider.service';
import { SoundHandlerService } from './sound-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SsffDataService {

  constructor(private config_provider_service: ConfigProviderService,
              private sound_handler_service: SoundHandlerService) { }

  // stores files referred to by ssffTrackDefinitions
  data = [];

  /////////////////////
  // public API

  /**
   * Search through ssffTrackDefinitions to find correct
   * file. Then search thought data and return file.
   * @param trackName name of track to get file for
   */
  getFile(trackName) {
    let res;
    if (this.config_provider_service.curDbConfig.ssffTrackDefinitions !== undefined) {
      this.config_provider_service.curDbConfig.ssffTrackDefinitions.forEach((std) => {
        if (std.name === trackName) {
          this.data.forEach(function (f) {
            if (f.fileExtension === std.fileExtension) {
              res = f;
            }
          });
        }
      });
    }
    return res;
  }

  /**
   *
   */
  getColumnOfTrack(trackName, columnName) {
    let res;
    let file = this.getFile(trackName);


    if (file !== undefined) {
      file.Columns.forEach(function (col) {
        if (col.name === columnName) {
          res = col;
        }
      });
      return res;
    }
  }


  /**
   *
   */
  getSampleRateAndStartTimeOfTrack(trackName) {
    let res: any = {};
    let file = this.getFile(trackName);

    if (file !== undefined) {
      res.sampleRate = file.sampleRate;
      res.startTime = file.startTime;
      return res;
    }
  }


  /**
   * calculates the closest audio sample of
   * the passed in column sample nr
   */
  calculateSamplePosInVP(colSampleNr, sampleRate, startTime) {
    let sampleTime = (colSampleNr / sampleRate) + startTime;
    let audioSample = Math.round(sampleTime * this.sound_handler_service.audioBuffer.sampleRate);
    return audioSample;
  }


}
