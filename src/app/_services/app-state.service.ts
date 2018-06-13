import { Injectable } from '@angular/core';

import { IohandlerService } from './iohandler.service';
import { LoadedMetaDataService } from './loaded-meta-data.service';
import { SoundHandlerService } from './sound-handler.service';
import { DataService } from './data.service';
import { SsffParserService } from './ssff-parser.service';
import { HistoryService } from './history.service';
import { ViewStateService } from './view-state.service';
import { SsffDataService } from './ssff-data.service';



@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  constructor(private iohandler_service: IohandlerService,
              private loaded_meta_data_service: LoadedMetaDataService,
              private sound_handler_service: SoundHandlerService,
              private data_service: DataService,
              private ssff_parser_service: SsffParserService,
              private history_service: HistoryService,
              private view_state_service: ViewStateService,
              private ssff_data_service: SsffDataService) { }

  /**
   *
   */
  resetToInitState () {
    if (this.iohandler_service.wsh.isConnected()) {
      this.iohandler_service.wsh.disconnectWarning().subscribe(() => {
        console.log('Closing websocket connection to server');
        this.iohandler_service.wsh.closeConnect();
      });
    }
    this.loaded_meta_data_service.resetToInitState();
    this.sound_handler_service.audioBuffer = {};
    this.data_service.setData({});
    console.error('DragnDropDataService.resetToInitState();')
    // DragnDropDataService.resetToInitState();
    // DragnDropService.resetToInitState();
    this.ssff_data_service.data = [];
    this.history_service.resetToInitState();
    this.view_state_service.setState('noDBorFilesloaded');
    this.view_state_service.somethingInProgress = false;
    this.view_state_service.resetToInitState();
    this.history_service.resetToInitState();
    this.view_state_service.showDropZone = true;
    console.error('reset url & check $rootScope.$broadcast');
    // $location.url($location.path()); // reset URL without get values
    // $rootScope.$broadcast('resetToInitState');
  }

  // reloadToInitState (session) {
  //   this.iohandler_service.wsH.closeConnect();
  //   // $scope.curBndl = {};
  //   let url = this.view_state_service.url;
  //   this.loaded_meta_data_service.resetToInitState();
  //   this.sound_handler_service.audioBuffer = {};
  //   this.data_service.setData({});
  //   // DragnDropDataService.resetToInitState();
  //   // DragnDropService.resetToInitState();
  //   this.ssff_data_service.data = [];
  //   this.history_service.resetToInitState();
  //   this.view_state_service.setState('noDBorFilesloaded');
  //   this.view_state_service.somethingInProgress = false;
  //   this.history_service.resetToInitState();
  //   this.view_state_service.resetToInitState();
  //   console.error('check $rootScope.$broadcast');
  //   // $rootScope.$broadcast('reloadToInitState', {url:url, session:session, reload:true });
  // }

}
