import { Injectable } from '@angular/core';

import { ViewStateService } from './view-state.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigProviderService {

  constructor(private view_state_service: ViewStateService) { }

  // shared service object
  vals;
  // sServObj.design = {};
  curDbConfig;
  // sServObj.initDbConfig = {};
  //
  // // embedded values -> if these are set this overrides the normal config
  // sServObj.embeddedVals = {
  //   audioGetUrl: '',
  //   labelGetUrl: '',
  //   labelType: '',
  //   fromUrlParams: false
  // };
  //
  // sServObj.setDesign = function (data) {
  //   angular.copy(data, sServObj.design);
  // };
  //
  /**
   * depth of 2 = max
   */
  public setVals(data) {
    if (!this.vals) {
      this.vals = data;
    } else {
      Object.keys(data).forEach((key1) => {
        // if array... overwrite entire thing!
        if (this.vals[key1] instanceof Array) {
          // empty array
          this.vals[key1] = [];
          data[key1].forEach((itm) => {
            this.vals[key1].push(itm);
          });
        } else {
          Object.keys(data[key1]).forEach((key2) => {
            if (this.vals[key1][key2] !== undefined) {
              this.vals[key1][key2] = data[key1][key2];
            } else {
              console.error('BAD ENTRY IN CONFIG! Key1: ' + key1 + ' key2: ' + key2);
            }
          });
        }

      });
    }
  }

  // sServObj.getDelta = function (current) {
  //   var defer = $q.defer();
  //   var ret = sServObj.getDeltas(current, sServObj.initDbConfig);
  //   defer.resolve(ret);
  //   return defer.promise;
  // };
  //
  // sServObj.getDeltas = function (current, start) {
  //   var ret = {};
  //   angular.forEach(current, function (value, key) {
  //     if (!angular.equals(value, start[key])) {
  //       if(Array.isArray(value)) {
  //         ret[key] = [];
  //         angular.copy(value, ret[key]);
  //       }
  //       else if(typeof value === 'object'){
  //         ret[key] = {};
  //         ret[key] = sServObj.getDeltas(value, start[key]);
  //       }
  //       else {
  //         if(key !== 'clear' && key !== 'openDemoDB' && key !== 'specSettings') {
  //           ret[key] = value;
  //         }
  //
  //       }
  //     }
  //   });
  //   return ret;
  // };

  /**
   *
   */
  getSsffTrackConfig = function (name) {
    let res;
    if (this.curDbConfig.ssffTrackDefinitions !== undefined) {
      this.curDbConfig.ssffTrackDefinitions.forEach((tr) => {
        if (tr.name === name) {
          res = tr;
        }
      });
    }
    return res;
  }

  /**
   *
   */
  getValueLimsOfTrack(trackName) {
    let res = {};
    this.vals.perspectives[this.view_state_service.curPerspectiveIdx].signalCanvases.minMaxValLims.forEach((vL) => {
      if (vL.ssffTrackName === trackName) {
        res = vL;
      }
    });

    return res;
  }

  /**
   *
   */
  getContourLimsOfTrack(trackName) {
    let res = {};
    this.vals.perspectives[this.view_state_service.curPerspectiveIdx].signalCanvases.contourLims.forEach((cL) => {
      if (cL.ssffTrackName === trackName) {
        res = cL;
      }
    });

    return res;
  }


  /**
   *
   */
  getContourColorsOfTrack(trackName) {
    let res;
    this.vals.perspectives[this.view_state_service.curPerspectiveIdx].signalCanvases.contourColors.forEach((cC) => {
      if (cC.ssffTrackName === trackName) {
        res = cC;
      }
    });

    return res;
  }

  // /**
  //  *
  //  */
  // sServObj.getAssignment = function (signalName) {
  //   var res = {};
  //   angular.forEach(sServObj.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign, function (a) {
  //     if (a.signalCanvasName === signalName) {
  //       res = a;
  //     }
  //   });
  //
  //   return res;
  // };
  //
  // /**
  //  *
  //  */
  // sServObj.getLevelDefinition = function (levelName) {
  //   var res = {};
  //   angular.forEach(sServObj.curDbConfig.levelDefinitions, function (ld) {
  //     if (ld.name === levelName) {
  //       res = ld;
  //     }
  //   });
  //
  //   return res;
  // };
  //
  // /**
  //  *
  //  */
  // sServObj.getAttrDefsNames = function (levelName) {
  //   var res = [];
  //   angular.forEach(sServObj.getLevelDefinition(levelName).attributeDefinitions, function (ad) {
  //     res.push(ad.name);
  //   });
  //
  //   return res;
  // };
  //
  //
  // /**
  //  *
  //  */
  // sServObj.setPerspectivesOrder = function (curPerspective, levelName) {
  //   if (sServObj.vals !== undefined) {
  //     if (sServObj.vals.perspectives !== undefined) {
  //       if (sServObj.vals.perspectives[curPerspective] !== undefined) {
  //         if (sServObj.vals.perspectives[curPerspective].levelCanvases !== undefined) {
  //           sServObj.vals.perspectives[curPerspective].levelCanvases.order = levelName;
  //         }
  //       }
  //     }
  //   }
  // };
  //
  // /**
  //  *  replace ascii codes from config with strings
  //  */
  // sServObj.getStrRep = function (code) {
  //   var str;
  //   switch (code) {
  //     case 8:
  //       str = 'BACKSPACE';
  //       break;
  //     case 9:
  //       str = 'TAB';
  //       break;
  //     case 13:
  //       str = 'ENTER';
  //       break;
  //     case 16:
  //       str = 'SHIFT';
  //       break;
  //     case 18:
  //       str = 'ALT';
  //       break;
  //     case 32:
  //       str = 'SPACE';
  //       break;
  //     case 37:
  //       str = '←';
  //       break;
  //     case 39:
  //       str = '→';
  //       break;
  //     case 38:
  //       str = '↑';
  //       break;
  //     case 40:
  //       str = '↓';
  //       break;
  //     case 42:
  //       str = '+';
  //       break;
  //     case 43:
  //       str = '+';
  //       break;
  //     case 45:
  //       str = '-';
  //       break;
  //     case 95:
  //       str = '-';
  //       break;
  //     default:
  //       str = String.fromCharCode(code);
  //   }
  //   return str;
  // };
  //
  //
  // return sServObj;
}
