import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ViewStateService } from './view-state.service';
import { HistoryService } from './history.service';
import { ConfigProviderService } from './config-provider.service';
import { LoadedMetaDataService } from './loaded-meta-data.service';
import { LevelService } from './level.service';
import { SsffDataService } from './ssff-data.service';
import { IohandlerService } from './iohandler.service';
import { ValidationService } from './validation.service';
import { BinaryDataManipHelperService } from './binary-data-manip-helper.service';
import { WavParserService } from './wav-parser.service';
import { SoundHandlerService } from './sound-handler.service';
import { SsffParserService } from './ssff-parser.service';
import { DataService } from './data.service'


@Injectable({
  providedIn: 'root'
})

export class DbObjLoadSaveService {

  constructor(private view_state_service: ViewStateService,
              private history_service: HistoryService,
              private config_provider_service: ConfigProviderService,
              private loaded_meta_data_service: LoadedMetaDataService,
              private level_service: LevelService,
              private ssff_data_service: SsffDataService,
              private io_handler_service: IohandlerService,
              private validation_service: ValidationService,
              private binary_data_manip_helper_service: BinaryDataManipHelperService,
              private wav_parser_service: WavParserService,
              private sound_handler_service: SoundHandlerService,
              private ssff_parser_service: SsffParserService,
              private data_service: DataService) { }

  /**
   * general loadBundle method.
   * @param bndl object containing name attribute of currently loaded bundle
   */
  loadBundle(bndl) {
    let subj = new Subject();
    // check if bndl has to be saved
    this.view_state_service.setcurClickItem(null);
    if ((this.history_service.movesAwayFromLastSave !== 0 &&
      this.config_provider_service.vals.main.comMode !== 'DEMO' &&
      this.config_provider_service.vals.activeButtons.saveBundle)) {
      let curBndl = this.loaded_meta_data_service.getCurBndl();
      if (bndl !== curBndl) {
        console.log('skldfjadsklfjkl');
  //       // $scope.lastclickedutt = bndl;
  //       modalService.open('views/saveChanges.html', curBndl.session + ':' + curBndl.name).then(function (messModal) {
  //         if (messModal === 'saveChanges') {
  //           // save current bundle
  //           sServObj.saveBundle().then(function () {
  //             // load new bundle
  //             sServObj.loadBundle(bndl);
  //           });
  //         } else if (messModal === 'discardChanges') {
  //           // reset history
  //           HistoryService.resetToInitState();
  //           // load new bundle
  //           sServObj.loadBundle(bndl);
  //         }
  //       });
      }
    } else {
      if (bndl !== this.loaded_meta_data_service.getCurBndl()) {
        console.log('here');
        // reset history
        this.history_service.resetToInitState();
        // reset hierarchy
        // this.view_state_service.hierarchyState.reset();
        // set state
        this.level_service.deleteEditArea();
        this.view_state_service.setEditing(false);
        this.view_state_service.setState('loadingSaving');

        this.view_state_service.somethingInProgress = true;
        this.view_state_service.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
        // empty ssff files
        this.ssff_data_service.data = [];
        this.io_handler_service.getBundle(bndl.name, bndl.session, this.loaded_meta_data_service.getDemoDbName()).subscribe((bundleData) => {
          // check if response from http request
          if (bundleData.status === 200) {
            bundleData = bundleData.data;
          }

          // validate bundle
          let validRes = this.validation_service.validateJSO('bundleSchema', bundleData);

          if (validRes === true) {

            let arrBuff;
            // set wav file
            if(bundleData.mediaFile.encoding === 'BASE64'){
              arrBuff = this.binary_data_manip_helper_service.base64ToArrayBuffer(bundleData.mediaFile.data);
              this.innerLoadBundle(bndl, bundleData, arrBuff, subj);
  //           }else if(bundleData.mediaFile.encoding === 'GETURL'){
  //             Iohandlerservice.httpGetPath(bundleData.mediaFile.data, 'arraybuffer').then(function (res) {
  //               innerLoadBundle(bndl, bundleData, res.data, defer);
  //             });
  //           }
  //         } else {
  //           modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(function () {
  //             appStateService.resetToInitState();
  //           });
          }
  //
  //
  //       }, function (errMess) {
  //         // check for http vs websocket response
  //         if (errMess.data) {
  //           modalService.open('views/error.html', 'Error loading bundle: ' + errMess.data).then(function () {
  //             appStateService.resetToInitState();
  //           });
  //         } else {
  //           modalService.open('views/error.html', 'Error loading bundle: ' + errMess.status.message).then(function () {
  //             appStateService.resetToInitState();
  //           });
          }
        });
      }
    }
    return subj;
  }

  innerLoadBundle(bndl, bundleData, arrBuff, subj) {

    this.view_state_service.somethingInProgressTxt = 'Parsing WAV file...';

    this.wav_parser_service.parseWavAudioBuf(arrBuff).subscribe((audioBuffer: any) => {
      // console.log(audioBuffer);
      this.view_state_service.curViewPort.sS = 0;
      this.view_state_service.curViewPort.eS = audioBuffer.length;
      if(bndl.timeAnchors !== undefined && bndl.timeAnchors.length > 0){
        this.view_state_service.curViewPort.selectS = bndl.timeAnchors[0].sample_start;
        this.view_state_service.curViewPort.selectE = bndl.timeAnchors[0].sample_end;
      }else {
        this.view_state_service.resetSelect();
      }
      this.view_state_service.curTimeAnchorIdx = -1;
      this.view_state_service.curClickItems = []; // used to be curClickSegment
      this.view_state_service.curClickLevelName = undefined;
      this.view_state_service.curClickLevelType = undefined;

      this.sound_handler_service.audioBuffer = audioBuffer;

      // set all ssff files
      this.view_state_service.somethingInProgressTxt = 'Parsing SSFF files...';
      this.ssff_parser_service.asyncParseSsffArr(bundleData.ssffFiles).subscribe((ssffJso) => {

        this.ssff_data_service.data = ssffJso.data;
        // set annotation
        this.data_service.setData(bundleData.annotation);
        this.loaded_meta_data_service.setCurBndl(bndl);
        // select first level
        this.view_state_service.selectLevel(false, this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.order, this.level_service);
        this.view_state_service.setState('labeling');

        this.view_state_service.somethingInProgress = false;
        this.view_state_service.somethingInProgressTxt = 'Done!';

        subj.next();

    //   }, function (errMess) {
    //     modalService.open('views/error.html', 'Error parsing SSFF file: ' + errMess.status.message).then(function () {
    //       appStateService.resetToInitState();
    //     });
    //   });
    // }, function (errMess) {
    //   modalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message).then(function () {
    //     appStateService.resetToInitState();
      });
    });
  }

  // /**
  //  * general purpose save bundle function.
  //  * @return promise that is resolved after completion (rejected on error)
  //  */
  // sServObj.saveBundle = function () {
  //   // check if something has changed
  //   // if (HistoryService.movesAwayFromLastSave !== 0) {
  //   if (viewState.getPermission('saveBndlBtnClick')) {
  //     var defer = $q.defer();
  //     viewState.somethingInProgress = true;
  //     viewState.setState('loadingSaving');
  //     //create bundle json
  //     var bundleData = {};
  //     viewState.somethingInProgressTxt = 'Creating bundle json...';
  //     bundleData.ssffFiles = [];
  //     // ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
  //     var formants = Ssffdataservice.getFile('FORMANTS');
  //
  //     if (formants !== undefined) {
  //       Ssffparserservice.asyncJso2ssff(formants).then(function (messParser) {
  //         bundleData.ssffFiles.push({
  //           'fileExtension': formants.fileExtension,
  //           'encoding': 'BASE64',
  //           'data': Binarydatamaniphelper.arrayBufferToBase64(messParser.data)
  //         });
  //         sServObj.getAnnotationAndSaveBndl(bundleData, defer);
  //
  //       }, function (errMess) {
  //         modalService.open('views/error.html', 'Error converting javascript object to SSFF file: ' + errMess.status.message);
  //         defer.reject();
  //       });
  //     } else {
  //       sServObj.getAnnotationAndSaveBndl(bundleData, defer);
  //     }
  //
  //     return defer.promise;
  //     // }
  //   } else {
  //     $log.info('Action: menuBundleSaveBtnClick not allowed!');
  //   }
  //
  // };
  //
  //
  // /**
  //  *
  //  */
  // sServObj.getAnnotationAndSaveBndl = function (bundleData, defer) {
  //
  //   // Validate annotation before saving
  //   viewState.somethingInProgressTxt = 'Validating annotJSON ...';
  //
  //   var validRes = Validationservice.validateJSO('annotationFileSchema', DataService.getData());
  //   if (validRes !== true) {
  //     $log.warn ('PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() will be called.');
  //     $log.error (validRes);
  //   }
  //
  //   // clean annot data just to be safe...
  //   StandardFuncsService.traverseAndClean(DataService.getData());
  //
  //   ////////////////////////////
  //   // construct bundle
  //
  //   // annotation
  //   bundleData.annotation = DataService.getData();
  //
  //   // empty media file (depricated since schema was updated)
  //   bundleData.mediaFile = {'encoding': 'BASE64', 'data': ''};
  //
  //   var curBndl = loadedMetaDataService.getCurBndl();
  //
  //   // add session if available
  //   if (typeof curBndl.session !== 'undefined') {
  //     bundleData.session = curBndl.session;
  //   }
  //   // add finishedEditing if available
  //   if (typeof curBndl.finishedEditing !== 'undefined') {
  //     bundleData.finishedEditing = curBndl.finishedEditing;
  //   }
  //   // add comment if available
  //   if (typeof curBndl.comment !== 'undefined') {
  //     bundleData.comment = curBndl.comment;
  //   }
  //
  //   // validate bundle
  //   viewState.somethingInProgressTxt = 'Validating bundle ...';
  //   validRes = Validationservice.validateJSO('bundleSchema', bundleData);
  //
  //   if (validRes !== true) {
  //     $log.error('GRAVE PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
  //     $log.error(validRes);
  //
  //     modalService.open('views/error.html', 'Somehow the data for this bundle has been corrupted. This is most likely a nasty and diffucult to spot bug. If you are at the IPS right now, please contact an EMU developer immediately. The Validation error is: ' + JSON.stringify(validRes, null, 4)).then(function () {
  //       viewState.somethingInProgressTxt = '';
  //       viewState.somethingInProgress = false;
  //       viewState.setState('labeling');
  //       defer.reject();
  //     });
  //   } else {
  //     viewState.somethingInProgressTxt = 'Saving bundle...';
  //     Iohandlerservice.saveBundle(bundleData).then(function () {
  //       viewState.somethingInProgressTxt = 'Done!';
  //       viewState.somethingInProgress = false;
  //       HistoryService.movesAwayFromLastSave = 0;
  //       defer.resolve();
  //       viewState.setState('labeling');
  //     }, function (errMess) {
  //       modalService.open('views/error.html', 'Error saving bundle: ' + errMess.status.message).then(function () {
  //         appStateService.resetToInitState();
  //       });
  //       defer.reject();
  //     });
  //   }
  // };
  // return (sServObj);

}
