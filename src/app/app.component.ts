import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute  } from '@angular/router';

import { ValidationService } from './_services/validation.service';
import { IohandlerService } from './_services/iohandler.service';
import { ConfigProviderService } from './_services/config-provider.service';
import { WebsocketHandlerService } from './_services/websocket-handler.service';
import { ViewStateService } from './_services/view-state.service';
import { LoadedMetaDataService } from './_services/loaded-meta-data.service';
import { DbObjLoadSaveService } from './_services/db-obj-load-save.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private validationservice: ValidationService,
              private iohs: IohandlerService,
              private cps: ConfigProviderService,
              private wsh: WebsocketHandlerService,
              private viewstateservice: ViewStateService,
              private loaded_meta_data_service: LoadedMetaDataService,
              private db_obj_load_save_service: DbObjLoadSaveService,
              // private route: ActivatedRoute
  ){}

  ngOnInit(){
    this.loadDefaultConfig();
  }


  private loadDefaultConfig() {
  //   viewState.somethingInProgress = true;
  //   viewState.somethingInProgressTxt = 'Loading schema files';
    // load schemas first
    this.validationservice.loadSchemas().subscribe(schemas => {
      console.log(schemas);
      this.validationservice.setSchemas(schemas);
      // this.iohs.httpGetDefaultDesign().subscribe(response => {
      //   console.log(response);
      // });
      this.iohs.httpGetDefaultConfig().subscribe(response => {
        console.log(response);
        // var validRes = Validationservice.validateJSO('emuwebappConfigSchema', response.data);
        //         var validRes = Validationservice.validateJSO('emuwebappConfigSchema', response.data);
        //         if (validRes === true) {
        this.cps.setVals(response);
        this.handleDefaultConfigLoaded();

      });
    });

  //     Iohandlerservice.httpGetDefaultDesign().then(function onSuccess (response) {
  //       ConfigProviderService.setDesign(response.data);
  //       Iohandlerservice.httpGetDefaultConfig().then(function onSuccess (response) {
  //         viewState.somethingInProgressTxt = 'Validating emuwebappConfig';
  //         var validRes = Validationservice.validateJSO('emuwebappConfigSchema', response.data);
  //         if (validRes === true) {
  //           ConfigProviderService.setVals(response.data);
  //           angular.copy($scope.cps.vals ,$scope.cps.initDbConfig);
  //           $scope.handleDefaultConfigLoaded();
  //           // loadFilesForEmbeddedApp if these are set
  //           $scope.loadFilesForEmbeddedApp();
  //           $scope.checkIfToShowWelcomeModal();
  //           // FOR DEVELOPMENT
  //           //$scope.aboutBtnClick();
  //           viewState.somethingInProgress = false;
  //         } else {
  //           modalService.open('views/error.html', 'Error validating / checking emuwebappConfigSchema: ' + JSON.stringify(validRes, null, 4)).then(function () {
  //             appStateService.resetToInitState();
  //           });
  //         }
  //
  //       }, function onError (response) {
  //         modalService.open('views/error.html', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + response.status + ' headers: ' + response.headers + ' config ' + response.config).then(function () {
  //           appStateService.resetToInitState();
  //         });
  //       });
  //     }, function onError (response) {
  //       modalService.open('views/error.html', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + response.status + ' headers: ' + response.headers + ' config ' + response.config).then(function () {
  //         appStateService.resetToInitState();
  //       });
  //     });
  //   }, function (errMess) {
  //     modalService.open('views/error.html', 'Error loading schema file: ' + JSON.stringify(errMess, null, 4)).then(function () {
  //       appStateService.resetToInitState();
  //     });
  //   });
  }


  /**
   * function called after default config was loaded
   */
  handleDefaultConfigLoaded() {

  //   if (!viewState.getsubmenuOpen()) {
  //     viewState.toggleSubmenu(ConfigProviderService.design.animation.period);
  //   }
    // check if either autoConnect is set in DBconfig or as get parameter
  // console.log(this.route.snapshot.params);
  //   if (ConfigProviderService.vals.main.autoConnect || searchObject.autoConnect === 'true') {
      if (!this.cps.vals.main.autoConnect) {
  //     if (typeof searchObject.serverUrl !== 'undefined') { // overwrite serverUrl if set as GET parameter
  //       ConfigProviderService.vals.main.serverUrl = searchObject.serverUrl;
  //     }
      this.wsh.initConnect(this.cps.vals.main.serverUrl).subscribe(
        (message) => {
          console.log('observerA: ' + message);

  //       if (message.type === 'error') {
  //         modalService.open('views/error.html', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl).then(function () {
  //           appStateService.resetToInitState();
  //         });
  //       } else {
          this.handleConnectedToWSserver({session: null, reload: null});
        }
  //       }
  //     }, function (errMess) {
  //       modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(function () {
  //         appStateService.resetToInitState();
  //       });
  //     });
      );
    }
  //
  //   // init loading of files for testing
  //   viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
  //     ConfigProviderService.vals.spectrogramSettings.rangeFrom,
  //     ConfigProviderService.vals.spectrogramSettings.rangeTo,
  //     ConfigProviderService.vals.spectrogramSettings.dynamicRange,
  //     ConfigProviderService.vals.spectrogramSettings.window,
  //     ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
  //     ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
  //     ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors);
  //
  //   // setting transition values
  //   viewState.setTransitionTime(ConfigProviderService.design.animation.period);
  }



/**
 * function is called after websocket connection
 * has been established. It executes the protocol
 * and loads the first bundle in the bundle list (= default behavior).
 */
  handleConnectedToWSserver(data) {
  // hide drop zone
  let session = data.session;
  let reload = data.reload;
//   viewState.showDropZone = false;
  this.cps.vals.main.comMode = 'WS';
  this.cps.vals.activeButtons.openDemoDB = false;
  // viewState.somethingInProgress = true;
//   viewState.somethingInProgressTxt = 'Checking protocol...';
  // Check if server speaks the same protocol
  this.iohs.getProtocol().subscribe((res) => {

    if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.2') {
//       viewState.somethingInProgressTxt = 'Checking user management...';
      // then ask if server does user management
      this.iohs.getDoUserManagement().subscribe((doUsrData) => {
        // console.log(doUsrData);
        if (doUsrData === 'NO') {
          this.innerHandleConnectedToWSserver({session: session, reload: reload});
        } else {
          // show user management error
//           modalService.open('views/loginModal.html').then(function (res) {
//             if (res) {
//               $scope.innerHandleConnectedToWSserver({session: session, reload: reload});
//             } else {
//               appStateService.resetToInitState();
//             }
//           });
        }
      });
//
    } else {
//       // show protocol error and disconnect from server
//       modalService.open('views/error.html', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"').then(function () {
//         appStateService.resetToInitState();
//       });
    }
  });
  }
//
/**
 * to avoid redundant code...
 */
innerHandleConnectedToWSserver(data) {
  let session = data.session;
  let reload = data.reload;
  this.viewstateservice.somethingInProgressTxt = 'Loading DB config...';
  // then get the DBconfigFile
  // this.iohs.httpGetDefaultDesign().then(function onSuccess(response) {
  //   ConfigProviderService.setDesign(response.data);

    this.iohs.getDBconfigFile('').subscribe((data) => {
      // first element of perspectives is default perspective
      this.viewstateservice.curPerspectiveIdx = 0;
      this.cps.setVals(data.EMUwebAppConfig);
      // FOR DEVELOPMENT
//       //$scope.showEditDBconfigBtnClick();


      let validRes = this.validationservice.validateJSO('emuwebappConfigSchema', this.cps.vals);
      if (validRes === true) {
        this.cps.curDbConfig = data;
        this.viewstateservice.setCurLevelAttrDefs(this.cps.curDbConfig.levelDefinitions);
        validRes = this.validationservice.validateJSO('DBconfigFileSchema', data);
        if (validRes === true) {
//           // then get the DBconfigFile
//           this.viewstateservice.somethingInProgressTxt = 'Loading bundle list...';
          this.iohs.getBundleList().subscribe((bdata) => {
            let validRes = this.loaded_meta_data_service.setBundleList(bdata);
            // show standard buttons
            this.cps.vals.activeButtons.clear = true;
            this.cps.vals.activeButtons.specSettings = true;

            if (validRes === true) {
              // then load first bundle in list
              if (session === null) {
                session = this.loaded_meta_data_service.getBundleList()[0];
              }
              this.db_obj_load_save_service.loadBundle(session).subscribe(() => {
                console.log('everything loaded!');
                // FOR DEVELOPMENT:
                // this.saveBundle(); // for testing save function
                // this.menuBundleSaveBtnClick(); // for testing save button
                // this.showHierarchyBtnClick(); // for devel of showHierarchy modal
                // this.spectSettingsBtnClick(); // for testing spect settings dial
                // this.searchBtnClick();
                // this.view_state_service.curViewPort.sS = 27455;
                // this.view_state_service.curViewPort.eS = 30180;

              });

              //viewState.currentPage = (viewState.numberOfPages(loadedMetaDataService.getBundleList().length)) - 1;
              // if(reload) {
//                 loadedMetaDataService.openCollapseSession(session.session);
//               }
//             } else {
//               modalService.open('views/error.html', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(function () {
//                 appStateService.resetToInitState();
//               });
            }
          });

        // } else {
//           modalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(function () {
//             appStateService.resetToInitState();
//           });
        }
//
//       } else {
//         modalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(function () {
//           appStateService.resetToInitState();
//         });
      }
  });
}

}
