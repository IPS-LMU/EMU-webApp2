import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WebsocketHandlerService } from './websocket-handler.service';
import { ConfigProviderService } from './config-provider.service';

@Injectable({
  providedIn: 'root'
})
export class IohandlerService {

  constructor(private http: HttpClient,
              private cps: ConfigProviderService,
              public wsh: WebsocketHandlerService) { }

  // // $http.defaults.useXDomain = true;
  //
  // sServObj.wsH = Websockethandler;
  //
  /**
   * default config is always loaded from same origin
   */
  public httpGetDefaultConfig() {
   return this.http.get('assets/configFiles/default_emuwebappConfig.json');
  }

  /**
   * default design is always loaded from same origin
   */
  public httpGetDefaultDesign() {
    return this.http.get('assets/configFiles/default_emuwebappDesign.json');
  }
  //
  // /**
  //  * default config is always loaded from same origin
  //  */
  // sServObj.httpGetPath = function (path, respType) {
  //   var prom = $http.get(path, {
  //     responseType: respType
  //   });
  //   return prom;
  // };

  ////////////////////////////
  // EMU-webApp protocol begins here

  /**
   *
   */
  public getProtocol() {
    console.log('in ioh getProtocol');
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of getProtocol not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.getProtocol();
    }

    return getSubj;
  };

  /**
   *
   */
  getDoUserManagement() {
    console.log('in ioh getDoUserManagement');
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of getDoUserManagement not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.getDoUserManagement();
    }

    return getSubj;
  };

  /**
   *
   */
  logOnUser(name, pwd) {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of logOnUser not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.logOnUser(name, pwd);
    }

    return getSubj;
  };

  /**
   *
   */
  getDBconfigFile(nameOfDB) {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of getDBconfigFile not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.getDBconfigFile();
    } else if (this.cps.vals.main.comMode === 'DEMO') {
      // getSubj = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
    }

    return getSubj;
  }

  /**
   *
   */
  getBundleList() {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of getBundleList not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.getBundleList();
    } else if (this.cps.vals.main.comMode === 'DEMO') {
      // getSubj = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
    }

    return getSubj;
  }

  /**
   *
   */
  getBundle(name, session, nameOfDB) {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of getBundle not implemented');
    } else if (this.cps.vals.main.comMode === 'EMBEDDED') {
      // getSubj = DragnDropDataService.getBundle(name, session);
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.getBundle(name, session);
    } else if (this.cps.vals.main.comMode === 'DEMO') {
      // // getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
      // getSubj = $http.get('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
    }

    return getSubj;
  }


  /**
   *
   */
  saveBundle(bundleData) {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      // console.error('CORS version of saveBundle not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.saveBundle(bundleData);
    }
    // else if (this.cps.vals.main.comMode === 'DEMO') {
    // getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
    // 	getProm = $http.get('testData/testAeBundle.json'); // SIC SIC SIC HARDCODED -> name is ignored
    // }

    return getSubj;
  }


  /**
   *
   */
  saveConfiguration(configData) {
    let getSubj;

    if (this.cps.vals.main.comMode === 'CORS') {
      console.error('CORS version of saveBundle not implemented');
    } else if (this.cps.vals.main.comMode === 'WS') {
      getSubj = this.wsh.saveConfiguration(configData);
    }
    return getSubj;
  }

  //
  // EMU-webApp protocol ends here
  ////////////////////////////

  // /**
  //  * pass through to according parser
  //  */
  // sServObj.parseLabelFile = function (string, annotates, name, fileType) {
  //   var prom;
  //   if (fileType === 'ESPS') {
  //     prom = Espsparserservice.asyncParseEsps(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
  //   } else if (fileType === 'TEXTGRID') {
  //     prom = Textgridparserservice.asyncParseTextGrid(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
  //   } else if (fileType === 'annotJSON') {
  //     var def = $q.defer();
  //     prom = def.promise;
  //     def.resolve(angular.fromJson(string));
  //   }
  //
  //   return prom;
  // };
}
