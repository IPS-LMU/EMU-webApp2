import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigProviderService {

  // shared service object
  vals: any;
  // this.design = {};
  curDbConfig: any;
  // this.initDbConfig = {};
  //
  // // embedded values -> if these are set this overrides the normal config
  // this.embeddedVals = {
  //   audioGetUrl: '',
  //   labelGetUrl: '',
  //   labelType: '',
  //   fromUrlParams: false
  // };
  //
  // this.setDesign = function (data) {
  //   angular.copy(data, this.design);
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

  // this.getDelta = function (current) {
  //   let defer = $q.defer();
  //   let ret = this.getDeltas(current, this.initDbConfig);
  //   defer.resolve(ret);
  //   return defer.promise;
  // };
  //
  // this.getDeltas = function (current, start) {
  //   let ret = {};
  //   angular.forEach(current, function (value, key) {
  //     if (!angular.equals(value, start[key])) {
  //       if(Array.isArray(value)) {
  //         ret[key] = [];
  //         angular.copy(value, ret[key]);
  //       }
  //       else if(typeof value === 'object'){
  //         ret[key] = {};
  //         ret[key] = this.getDeltas(value, start[key]);
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
  getValueLimsOfTrack(trackName, perspectiveIndex: number) {
    let res = {};
    this.vals.perspectives[perspectiveIndex].signalCanvases.minMaxValLims.forEach((vL) => {
      if (vL.ssffTrackName === trackName) {
        res = vL;
      }
    });

    return res;
  }

  /**
   *
   */
  getContourLimsOfTrack(trackName, perspectiveIndex: number) {
    let res = {};
    this.vals.perspectives[perspectiveIndex].signalCanvases.contourLims.forEach((cL) => {
      if (cL.ssffTrackName === trackName) {
        res = cL;
      }
    });

    return res;
  }


  /**
   *
   */
  getContourColorsOfTrack(trackName, perspectiveIndex: number) {
    let res;
    this.vals.perspectives[perspectiveIndex].signalCanvases.contourColors.forEach((cC) => {
      if (cC.ssffTrackName === trackName) {
        res = cC;
      }
    });

    return res;
  }

  // /**
  //  *
  //  */
  // this.getAssignment = function (signalName) {
  //   let res = {};
  //   angular.forEach(this.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign, function (a) {
  //     if (a.signalCanvasName === signalName) {
  //       res = a;
  //     }
  //   });
  //
  //   return res;
  // };

  /**
   *
   */
  public getLevelDefinition (levelName): any {
    let res = {};
    this.curDbConfig.levelDefinitions.forEach((ld) => {
      if (ld.name === levelName) {
        res = ld;
      }
    });

    return res;
  }

  // /**
  //  *
  //  */
  // this.getAttrDefsNames = function (levelName) {
  //   let res = [];
  //   angular.forEach(this.getLevelDefinition(levelName).attributeDefinitions, function (ad) {
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
  // this.setPerspectivesOrder = function (curPerspective, levelName) {
  //   if (this.vals !== undefined) {
  //     if (this.vals.perspectives !== undefined) {
  //       if (this.vals.perspectives[curPerspective] !== undefined) {
  //         if (this.vals.perspectives[curPerspective].levelCanvases !== undefined) {
  //           this.vals.perspectives[curPerspective].levelCanvases.order = levelName;
  //         }
  //       }
  //     }
  //   }
  // };
  //
  // /**
  //  *  replace ascii codes from config with strings
  //  */
  // this.getStrRep = function (code) {
  //   let str;
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
