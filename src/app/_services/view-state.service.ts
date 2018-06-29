import { Injectable } from '@angular/core';

import { SoundHandlerService } from './sound-handler.service';
import {DataService} from './data.service';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';
import {
    calculateSampleTime,
    getMousePositionInCanvasX, getMousePositionInCanvasY,
    getPixelDistanceBetweenSamples,
    getPixelPositionOfSampleInViewport, getSamplesPerPixelInViewport
} from '../_utilities/view-state-helper-functions';
import {SpectrogramSettings} from '../_interfaces/spectrogram-settings.interface';
import {PreselectedItemInfo} from '../_interfaces/preselected-item-info.interface';


@Injectable({
  providedIn: 'root'
})
export class ViewStateService {

  constructor(private sound_handler_service: SoundHandlerService) {
    this.initialize();
  }

  // communication modes enum
  myMode = {
    DEMO: 1,
    WS: 2,
    EMBEDDED: 3
  };

  // time modes enum
  myTimeMode = {
    absolute: 1,
    relative: 2
  };

  // signal types enum
  mySignalType = {
    OSCI: 1,
    SPEC: 2
  };

  // twoDim types enum
  myTwoDimType = {
    DOTS: 1,
    EPG: 2
  };

  // hold the current attribute definitions that are in view
  // curLevelAttrDefs = [];

  //////////////////////////////
  // vars reset by initialize()

  curViewPort;

  spectroSettings: SpectrogramSettings;

  osciSettings;

  playHeadAnimationInfos;

  hierarchyState;


  timelineSize;
  somethingInProgress;
  somethingInProgressTxt;
  historyActionTxt;
  cursorInTextField;
  saving;
  submenuOpen;
  rightSubmenuOpen;
  curClickItems;
  curMousePosSample;
  crosshairPosition: number;
  preselectedItemInfo: PreselectedItemInfo;
  curMouseTrackName;
  currentMouseOverLevel: ILevel;
  currentClickLevel: ILevel;
  curPreselColumnSample;
  curCorrectionToolNr;
  start;
  TransitionTime;
  showDropZone;
  movingBoundarySample: number;
  focusInTextField;
  curTaskPercCompl;
  curPerspectiveIdx;
  mouseInEmuWebApp;
  focusOnEmuWebApp;
  lastKeyCode;
  lastUpdate;
  url;
  pageSize;
  currentPage;
  curTimeAnchorIdx;
  largeTextFieldInputFieldVisable;
  largeTextFieldInputFieldCurLabel;

  // possible general states of state machine
  states;

  prevState;
  curState;

  curLevelAttrDefs: {
    levelName: string;
    curAttrDefName: string;
    // curAttrDefIndex: number; @todo the functions setCrrAttrDef and getCurAttrDefIndex have been commented out - these were the only ones to use the currAttrDefIndex property
  }[];

  /**
   * initialize all needed vars in viewState
   */
  initialize() {
    this.curViewPort = {
      sS: 0,
      eS: 0,
      selectS: -1,
      selectE: -1,
      movingS: -1,
      movingE: -1,
      dragBarActive: false,
      dragBarHeight: -1,
      windowWidth: undefined
    };

    this.spectroSettings = {
      windowSizeInSecs: -1,
      rangeFrom: -1,
      rangeTo: -1,
      dynamicRange: -1,
      window: 'BARTLETTHANN',
      transparency: -1,
      drawHeatMapColors: false,
      heatMapColorAnchors: [],
      preEmphasisFilterFactor: -1
    };

    this.osciSettings = {
      curChannel: 0
    };

    this.playHeadAnimationInfos = {
      sS: -1,
      eS: -1,
      curS: null,
      endFreezeSample: -1,
      autoscroll: false
    };


    // HierarchyState object with all variables and functions
    this.hierarchyState = {
  //     hierarchyShown: false,
  //
  //     // These variables will be set from within the emuhierarchy directive
  //     // The directive will not watch for outside changes
  //     selectedItemID: undefined,
  //     selectedLinkFromID: undefined,
  //     selectedLinkToID: undefined,
  //     editValue: undefined,
  //     inputFocus: false,
  //     collapseInfo: {},
  //     scaleFactor: 1,
  //     translate: [0, 0],
  //
  //     // These can be set from within the emuhierarchy directive
  //     // But the directive will also watch for outside changes
  //     contextMenuID: undefined,
  //     newLinkFromID: undefined,
  //
  //     // These will be set by outside components
  //     path: [],
  //     curPathIdx: 0,
  //     curNrOfPaths: 0,
  //     rotated: false,
  //     playing: 0, //this is only watched indirectly (the view injects this value into the directive)
  //     resize: 0,
  //
  //     // member functions
  //
  //     closeContextMenu: function () {
  //       sServObj.hierarchyState.contextMenuID = undefined;
  //     },
  //
  //     getContextMenuID: function () {
  //       return sServObj.hierarchyState.contextMenuID;
  //     },
  //
  //     getInputFocus: function () {
  //       return sServObj.hierarchyState.inputFocus;
  //     },
  //
  //     getEditValue: function () {
  //       return sServObj.hierarchyState.editValue;
  //     },
  //
  //     setEditValue: function (e) {
  //       sServObj.hierarchyState.editValue = e;
  //     },
  //
  //     reset: function () {
  //       sServObj.hierarchyState.selectedItemID = undefined;
  //       sServObj.hierarchyState.selectedLinkFromID = undefined;
  //       sServObj.hierarchyState.selectedLinkToID = undefined;
  //       sServObj.hierarchyState.editValue = undefined;
  //       sServObj.hierarchyState.inputFocus = false;
  //       sServObj.hierarchyState.collapseInfo = {};
  //       sServObj.hierarchyState.scaleFactor = 1;
  //       sServObj.hierarchyState.translate = [0, 0];
  //       sServObj.hierarchyState.contextMenuID = undefined;
  //       sServObj.hierarchyState.newLinkFromID = undefined;
  //     },
  //
  //     /**
  //      *
  //      */
  //     isRotated: function () {
  //       return sServObj.hierarchyState.rotated;
  //     },
  //
  //     /**
  //      *
  //      */
  //     toggleRotation: function () {
  //       sServObj.hierarchyState.rotated = !sServObj.hierarchyState.rotated;
  //     },
  //
  //     /**
  //      *
  //      */
  //     toggleHierarchy: function () {
  //       sServObj.hierarchyState.hierarchyShown = !sServObj.hierarchyState.hierarchyShown;
  //       if (sServObj.hierarchyState.hierarchyShown === false) {
  //         // Make sure no private attributes (such as do start with an underscore
  //         // are left in the data when the hierarchy modal is closed
  //         StandardFuncsService.traverseAndClean (DataService.getData());
  //       }
  //     },
  //
  //     isShown: function () {
  //       return sServObj.hierarchyState.hierarchyShown;
  //     },
  //
  //
  //     /**
  //      *
  //      */
  //     getCollapsed: function (id) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         return false;
  //       } else {
  //         if (typeof sServObj.hierarchyState.collapseInfo[id].collapsed === 'boolean') {
  //           return sServObj.hierarchyState.collapseInfo[id].collapsed;
  //         } else {
  //           return false;
  //         }
  //       }
  //     },
  //
  //     /**
  //      *
  //      */
  //     getCollapsePosition: function (id) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         return undefined;
  //       } else {
  //         if (typeof sServObj.hierarchyState.collapseInfo[id].collapsePosition === 'object') {
  //           return sServObj.hierarchyState.collapseInfo[id].collapsePosition;
  //         } else {
  //           return undefined;
  //         }
  //       }
  //     },
  //
  //     /**
  //      *
  //      */
  //     getNumCollapsedParents: function (id) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         return 0;
  //       } else {
  //         if (typeof sServObj.hierarchyState.collapseInfo[id].numCollapsedParents === 'number') {
  //           return sServObj.hierarchyState.collapseInfo[id].numCollapsedParents;
  //         } else {
  //           return 0;
  //         }
  //       }
  //     },
  //
  //     /**
  //      *
  //      */
  //     setCollapsed: function (id, newState) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         sServObj.hierarchyState.collapseInfo[id] = {};
  //       }
  //
  //       sServObj.hierarchyState.collapseInfo[id].collapsed = newState;
  //     },
  //
  //     /**
  //      *
  //      */
  //     setCollapsePosition: function (id, newPosition) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         sServObj.hierarchyState.collapseInfo[id] = {};
  //       }
  //
  //       sServObj.hierarchyState.collapseInfo[id].collapsePosition = newPosition;
  //     },
  //
  //     /**
  //      *
  //      */
  //     setNumCollapsedParents: function (id, newNum) {
  //       if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
  //         sServObj.hierarchyState.collapseInfo[id] = {};
  //       }
  //
  //       sServObj.hierarchyState.collapseInfo[id].numCollapsedParents = newNum;
  //     }
    };

    this.timelineSize = -1;
    this.somethingInProgress = false;
    this.somethingInProgressTxt = '';
    this.historyActionTxt = '';
    this.cursorInTextField = false;
    this.saving = true;
    this.submenuOpen = false;
    this.rightSubmenuOpen = false;
    this.curClickItems = [];
    this.curMousePosSample = 0;
    this.preselectedItemInfo = null;
    this.crosshairPosition = 0;
    this.curMouseTrackName = undefined;
    this.currentMouseOverLevel = undefined;
    this.currentClickLevel = undefined;
    this.curPreselColumnSample = 2;
    this.curCorrectionToolNr = undefined;
    this.start = null;
    this.TransitionTime = undefined;
    this.showDropZone = true;
    this.movingBoundarySample = null;
    this.focusInTextField = false;
    this.curTaskPercCompl = 0;
    this.curPerspectiveIdx = -1;
    this.mouseInEmuWebApp = false;
    this.focusOnEmuWebApp = true;
    this.lastKeyCode = undefined;
    this.lastUpdate = undefined;
    this.url = undefined;
    this.pageSize = 500;
    this.currentPage = undefined;
    this.curTimeAnchorIdx = -1;
    this.largeTextFieldInputFieldVisable = false;
    this.largeTextFieldInputFieldCurLabel = '';

    // possible general states of state machine
    this.states = [];
    this.states.noDBorFilesloaded = {
      'permittedActions': [
        'connectBtnClick',
        'openDemoBtnDBclick',
        'aboutBtnClick'
      ]
    };
    this.states.loadingSaving = {
      'permittedActions': []
    };
    this.states.labeling = {
      'permittedActions': [
        'zoom',
        'playaudio',
        'spectSettingsChange',
        'addLevelSegBtnClick',
        'addLevelPointBtnClick',
        'renameSelLevelBtnClick',
        'downloadTextGridBtnClick',
        'downloadAnnotationBtnClick',
        'spectSettingsChange',
        'clearBtnClick',
        'labelAction',
        'toggleSideBars',
        'saveBndlBtnClick',
        'showHierarchyBtnClick',
        'editDBconfigBtnClick',
        'aboutBtnClick',
        'searchBtnClick'
      ]
    };
    this.states.modalShowing = this.states.loadingSaving;
    this.prevState = this.states.noDBorFilesloaded;
    this.curState = this.states.noDBorFilesloaded;

    this.curLevelAttrDefs = [];
  }

  /**
   * function to ask permission in current labeler state
   */
getPermission(actionName) {
  return (this.curState.permittedActions.indexOf(actionName) > -1);
}

  // /**
  //  *
  //  */
  // sServObj.setWindowWidth = function (b) {
  //   this.curViewPort.windowWidth = b;
  // };

  /**
   * set state
   */
setState(nameOrObj) {
    this.prevState = this.curState;
    if (typeof nameOrObj === 'string') {
      this.curState = this.states[nameOrObj];
    } else {
      this.curState = nameOrObj;
    }
  }

  /**
   *
   */
  public updatePlayHead(timestamp) {
    // at first push animation !!!
    if (this.sound_handler_service.isPlaying) {
      window.requestAnimationFrame(this.updatePlayHead);
    }

    // do work in this animation round now
    if (this.start === null) {
      this.start = timestamp;
    }

    let samplesPassed = (Math.floor(timestamp - this.start) / 1000) * this.sound_handler_service.audioBuffer.sampleRate;
    this.playHeadAnimationInfos.curS = Math.floor(this.playHeadAnimationInfos.sS + samplesPassed);

    if (this.sound_handler_service.isPlaying && this.playHeadAnimationInfos.curS <= this.playHeadAnimationInfos.eS) {
      if (this.playHeadAnimationInfos.curS !== -1) {
        this.curMousePosSample = this.playHeadAnimationInfos.curS;
      }
      if (this.playHeadAnimationInfos.autoscroll && this.playHeadAnimationInfos.curS >= this.curViewPort.eS) {
        this.setViewPort(this.curViewPort.eS, this.curViewPort.eS + (this.curViewPort.eS - this.curViewPort.sS));
      }
    } else {
      this.curMousePosSample = this.playHeadAnimationInfos.endFreezeSample;
      this.playHeadAnimationInfos.sS = -1;
      this.playHeadAnimationInfos.eS = -1;
      this.playHeadAnimationInfos.curS = 0;
      this.start = null;
    }

    // $rootScope.$apply();
  }

  /**
   *
   */
  public animatePlayHead(startS, endS, autoscroll) {
    this.playHeadAnimationInfos.sS = startS;
    this.playHeadAnimationInfos.eS = endS;
    this.playHeadAnimationInfos.endFreezeSample = endS;
    this.playHeadAnimationInfos.curS = startS;
    if(autoscroll){
      this.playHeadAnimationInfos.autoscroll = autoscroll;
    }
    window.requestAnimationFrame(this.updatePlayHead);
  }


  // /**
  //  * set selected Area
  //  * @param start of selected Area
  //  * @param end of selected Area
  //  */
  // sServObj.select = function (start, end) {
  //   sServObj.curViewPort.selectS = start;
  //   sServObj.curViewPort.selectE = end;
  //   //$rootScope.$digest();
  // };


  /**
   * reset selected Area to default
   */
  resetSelect = function () {
    this.curViewPort.selectS = -1;
    this.curViewPort.selectE = -1;
  };

  // /**
  //  * gets the current Viewport
  //  */
  // sServObj.getViewPort = function () {
  //   return sServObj.curViewPort;
  // };
  //
  /**
   * setspectroSettings
   */
  setspectroSettings(len, rfrom, rto, dyn, win, hm, preEmph, hmColorAnchors, transparency) {
    this.spectroSettings.windowSizeInSecs = len;
    this.spectroSettings.rangeFrom = parseInt(rfrom, 10);
    this.spectroSettings.rangeTo = parseInt(rto, 10);
    this.spectroSettings.dynamicRange = parseInt(dyn, 10);
    this.spectroSettings.window = win;
    this.spectroSettings.drawHeatMapColors = hm;
    this.spectroSettings.preEmphasisFilterFactor = preEmph;
    this.spectroSettings.heatMapColorAnchors = hmColorAnchors;
    this.spectroSettings.transparency = transparency;
  }

  // /**
  //  * setOsciSettings
  //  */
  // sServObj.setOsciSettings = function (curCh) {
  //   sServObj.osciSettings.curChannel = curCh;
  // };
  //
  //
  // /**
  //  * returns current selection as array
  //  */
  // sServObj.getSelect = function () {
  //   return [sServObj.curViewPort.selectS, sServObj.curViewPort.selectE];
  // };
  //
  // /**
  //  * set selected Area if new
  //  * start value is smaler than actual and
  //  * end value is greater than actual
  //  * @param start of selected Area
  //  * @param end of seleected Area
  //  */
  // sServObj.selectDependent = function (start, end) {
  //   if (start < this.curViewPort.selectS) {
  //     this.curViewPort.selectS = start;
  //   }
  //   if (end > this.curViewPort.selectE) {
  //     this.curViewPort.selectE = end;
  //   }
  // };

  /**
   *
   */
  selectLevel(next, order, data_service: DataService) {
    let curLev;
    let now = this.getCurrentClickLevel();
    if (now === undefined) {
      if (!next) {
        // select first if none prev. defined (up)
        // viewState.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
        curLev = data_service.getLevelDataByName(order[0]);
        if(curLev !== null) {
          this.setCurrentClickLevel(curLev);
        }
        return;
      }
      else {
        // select last if none prev. defined (down)
        curLev = data_service.getLevelDataByName(order[order.length - 1]);
        this.setCurrentClickLevel(curLev);
        return;
      }
    }
    let idxOfNow = -1;
    order.forEach((name, idx) => {
      if (name === now.name) {
        idxOfNow = idx;
      }
    });
    if (idxOfNow === undefined) {
      curLev = data_service.getLevelDataByName(order[0]);
      this.setCurrentClickLevel(curLev);
      this.curClickItems = [];
      this.selectBoundary();
    }
    else {
      if (next) {
        if (idxOfNow + 1 < order.length) {
          curLev = data_service.getLevelDataByName(order[idxOfNow + 1]);
          // sServObj.setcurClickLevelName(order[idxOfNow + 1]);
          this.setCurrentClickLevel(curLev);
          this.curClickItems = [];
          this.selectBoundary();
          //sServObj.resetSelect();
        }
      } else {
        if (idxOfNow - 1 >= 0) {
          curLev = data_service.getLevelDataByName(order[idxOfNow - 1]);
          // sServObj.setcurClickLevelName(order[idxOfNow - 1]);
          this.setCurrentClickLevel(curLev);
          this.curClickItems = [];
          this.selectBoundary();
          //sServObj.resetSelect();
        }
      }
    }
  }

  //
  // /**
  //  * @returns myWindow object
  //  */
  // sServObj.getWindowFunctions = function () {
  //   return myWindow;
  // };
  //
  // /**
  //  * @returns myWindow object
  //  */
  // sServObj.getCommunicationModes = function () {
  //   return myMode;
  // };
  //
  // /**
  //  * @returns myWindow object
  //  */
  // sServObj.getTimeModes = function () {
  //   return myTimeMode;
  // };
  //
  // /**
  //  * @returns myWindow object
  //  */
  // sServObj.getSignalTypes = function () {
  //   return mySignalType;
  // };
  //
  // /**
  //  * @returns myWindow object
  //  */
  // sServObj.getTwoDimTypes = function () {
  //   return myTwoDimType;
  // };

  /**
   * set if user is dragging dragbar
   */
  public getdragBarActive() {
    return this.curViewPort.dragBarActive;
  }


  /**
   * set if user is dragging dragbar
   */
  public setdragBarActive(b) {
    this.curViewPort.dragBarActive = b;
  }

  /**
   * set if user is dragging dragbar
   */
  public getdragBarHeight() {
    return this.curViewPort.dragBarHeight;
  }


  // /**
  //  * set if user is dragging dragbar
  //  */
  // sServObj.setdragBarHeight = function (b) {
  //   this.curViewPort.dragBarHeight = b;
  // };
  //

  /**
   * get pixel position in current viewport given the canvas width
   * @param w is width of canvas
   * @param s is current sample to convert to pixel value
   */
  public getPos(w, s) {
    return getPixelPositionOfSampleInViewport(s, this.curViewPort.sS, this.curViewPort.eS, w);
  };

  /**
   * calculate the pixel distance between two samples
   * @param w is width of canvas
   */
  public getSampleDist(w) {
    return getPixelDistanceBetweenSamples(this.curViewPort.sS, this.curViewPort.eS, w);
  }


  // /**
  //  * toggle boolean if left submenu is open
  //  */
  // sServObj.toggleSubmenu = function (time) {
  //   this.submenuOpen = !this.submenuOpen;
  //   // hack to call $apply post animation
  //   $timeout(function () {
  //     var d = new Date();
  //     sServObj.lastUpdate = d.getTime();
  //   }, time);
  // };
  //
  // /**
  //  * get boolean if left submenu is open
  //  */
  // sServObj.getsubmenuOpen = function () {
  //   return this.submenuOpen;
  // };
  //
  // /**
  //  * set boolean if left submenu is open
  //  */
  // sServObj.setsubmenuOpen = function (s) {
  //   this.submenuOpen = s;
  // };
  //
  //
  // /**
  //  * get the height of the osci
  //  */
  // sServObj.setenlarge = function (s) {
  //   this.timelineSize = s;
  // };
  //
  //
  // /**
  //  * get the height of the osci
  //  */
  // sServObj.getenlarge = function () {
  //   return this.timelineSize;
  // };
  //
  // /**
  //  * get the height of the osci
  //  */
  // sServObj.getTransitionTime = function () {
  //   return this.TransitionTime;
  // };
  //
  // /**
  //  * get the height of the osci
  //  */
  // sServObj.setTransitionTime = function (s) {
  //   this.TransitionTime = s;
  // };
  //
  // /**
  //  * get the height of the osci
  //  */
  // sServObj.getRightsubmenuOpen = function () {
  //   return this.rightSubmenuOpen;
  // };
  //

  /**
   * get the height of the osci
   */
  setRightsubmenuOpen(s) {
    this.rightSubmenuOpen = s;
  }

  public setCurrentClickLevel(level: ILevel) {
      this.currentClickLevel = level;
  }

  public getCurrentClickLevel(): ILevel {
      return this.currentClickLevel;
  }

  public setCurrentMouseOverLevel(level: ILevel) {
    this.currentMouseOverLevel = level;
  }

  public getCurrentMouseOverLevel(): ILevel {
    return this.currentMouseOverLevel;
  }


    /**
   * gets the current (clicked) Level Name
   */
  getcurClickNeighbours() {
    // return this.curClickNeighbours;
  }


  /**
   * Preselects an item (usually called upon MouseMove)
   */
  public preselectItem(info: PreselectedItemInfo) {
      this.preselectedItemInfo = info;
  }

  public getPreselectedItemInfo() {
      return this.preselectedItemInfo;
  }

  public removePreselection() {
    this.preselectedItemInfo = null;
  }

  // /**
  //  * Getter for current Mouse Item Neighbours (left and right)
  //  * @return Object representing the current mouse item neighbours
  //  */
  // sServObj.getcurMouseNeighbours = function () {
  //   return this.curMouseNeighbours;
  // };
  //
  // /**
  //  * get all items of current level which are inside the selected viewport
  //  */
  // sServObj.getItemsInSelection = function (levelData) {
  //   var itemsInRange = [];
  //   var rangeStart = sServObj.curViewPort.selectS;
  //   var rangeEnd = sServObj.curViewPort.selectE;
  //   angular.forEach(levelData, function (t) {
  //     if (t.name === sServObj.getcurClickLevelName()) {
  //       angular.forEach(t.items, function (item) {
  //         if (item.sampleStart >= rangeStart && (item.sampleStart + item.sampleDur) <= rangeEnd) {
  //           itemsInRange.push(item);
  //         }
  //         if (item.samplePoint >= rangeStart && item.samplePoint <= rangeEnd) {
  //           itemsInRange.push(item);
  //         }
  //       });
  //     }
  //   });
  //   return itemsInRange.sort(LevelService.sortItemsByStart);
  // };


  /**
   * Setter for the current (click) Item
   * @param item Object representing the currently clicked item
   */
  setcurClickItem(items) {
    console.log("setcurClickItem()");
    this.curClickItems = items;
    this.selectBoundary();
  }


  /**
   * Selects the current Boundary
   */
  selectBoundary() {
    if (this.curClickItems.length > 0) {
      let left, right;
      if (typeof this.curClickItems[0].samplePoint === 'undefined') {
        left = this.curClickItems[0].sampleStart;
      }else{
        left = this.curClickItems[0].samplePoint;
      }

      if( typeof this.curClickItems[0].samplePoint === 'undefined') {
        right = this.curClickItems[this.curClickItems.length - 1].sampleStart + this.curClickItems[this.curClickItems.length - 1].sampleDur;
      }else{
        right = this.curClickItems[0].samplePoint;
      }

      this.curClickItems.forEach((entry) => {
        if (entry.sampleStart <= left) {
          left = entry.sampleStart;
        }
        if (entry.sampleStart + entry.sampleDur >= right) {
          right = entry.sampleStart + entry.sampleDur;
        }
      });
      // sServObj.select(left, right + 1);
    }
  }

  // /**
  //  * Getter for the current selected range in samples
  //  * if nothing is selected returns -1
  //  * @return Object with Start and End values in samples
  //  */
  // sServObj.getselectedRange = function () {
  //   if (this.curClickItems.length > 1) {
  //     return {
  //       start: this.curClickItems[0].sampleStart,
  //       end: (this.curClickItems[this.curClickItems.length - 1].sampleStart + this.curClickItems[this.curClickItems.length - 1].sampleDur)
  //     };
  //   } else if (this.curClickItems.length === 1) {
  //     if (this.curClickItems[0].sampleStart !== undefined) {
  //       return {
  //         start: this.curClickItems[0].sampleStart,
  //         end: (this.curClickItems[0].sampleStart + this.curClickItems[0].sampleDur)
  //       };
  //     } else {
  //       return {
  //         start: this.curClickItems[0].samplePoint,
  //         end: this.curClickItems[0].samplePoint
  //       };
  //     }
  //
  //   } else {
  //     return {
  //       start: -1,
  //       end: -1
  //     };
  //   }
  // };

  /**
   * Getter for the currently (clicked) items
   */
  public getcurClickItems = function () {
    return this.curClickItems;
  };


  /**
   *
   */
  public getselected = function () {
    return this.curClickItems;
  };


  /**
   *
   */
  public getcursorInTextField () {
    return this.cursorInTextField;
  }

  /**
   *
   */
  public setcursorInTextField (n) {
    this.cursorInTextField = n;
  }

  /**
   *
   */
  public isSavingAllowed () {
    return this.saving;
  }

  /**
   *
   */
  public setSavingAllowed (n) {
    this.saving = n;
  }

  /**
   *
   */
  public countSelected () {
    return this.curClickItems.length;
  }

  /**
   *
   */
  public getCurrentSample(perc) {
    return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
  }

  // /**
  //  *
  //  */
  // sServObj.getCurrentPercent = function (sample) {
  //   return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
  // };

  /**
   *
   */
  public getSamplesPerPixelVal(event) {
    let start = parseFloat(this.curViewPort.sS);
    let end = parseFloat(this.curViewPort.eS);
    return getSamplesPerPixelInViewport(start, end, event.target);
  }


  /**
   * calcs and returns start in secs
   */
  public getViewPortStartTime() {
    return (this.curViewPort.sS / this.sound_handler_service.audioBuffer.sampleRate) - 0.5 / this.sound_handler_service.audioBuffer.sampleRate;
  }

  /**
   * calcs and returns end time in secs
   */
  public getViewPortEndTime() {
    return (this.curViewPort.eS / this.sound_handler_service.audioBuffer.sampleRate) + 0.5 / this.sound_handler_service.audioBuffer.sampleRate;
  }

  // /**
  //  * calcs and returns start in secs
  //  */
  // sServObj.getSelectedStartTime = function () {
  //   return (this.curViewPort.selectS / Soundhandlerservice.audioBuffer.sampleRate) - 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
  // };
  //
  // /**
  //  * calcs and returns end time in secs
  //  */
  // sServObj.getSelectedEndTime = function () {
  //   return (this.curViewPort.selectE / Soundhandlerservice.audioBuffer.sampleRate) + 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
  // };

  /**
   * calcs sample time in seconds
   */
  calcSampleTime(sample) {
    return calculateSampleTime(sample, this.sound_handler_service.audioBuffer.sampleRate);
  }


  /**
   * set view port to start and end sample
   * (with several out-of-bounds like checks)
   *
   * @param sSample start sample of view
   * @param eSample end sample of view
   */
  public setViewPort(sSample, eSample) {
    let oldStart = this.curViewPort.sS;
    let oldEnd = this.curViewPort.eS;
    if (sSample !== undefined) {
      this.curViewPort.sS = Math.round(sSample);
    }
    if (eSample !== undefined) {
      this.curViewPort.eS = Math.round(eSample);
    }

    // check if moving left or right is not out of bounds -> prevent zooming on edge when moving left/right
    if (oldStart > this.curViewPort.sS && oldEnd > this.curViewPort.eS) {
      //moved left
      if (this.curViewPort.sS < 0) {
        this.curViewPort.sS = 0;
        this.curViewPort.eS = oldEnd + Math.abs(this.curViewPort.sS);
      }
    }
    if (oldStart < this.curViewPort.sS && oldEnd < this.curViewPort.eS) {
      //moved right
      if (this.curViewPort.eS > this.sound_handler_service.audioBuffer.length) {
        this.curViewPort.sS = oldStart;
        this.curViewPort.eS = this.sound_handler_service.audioBuffer.length;
      }
    }

    // check if in range
    if (this.curViewPort.sS < 0) {
      this.curViewPort.sS = 0;
    }
    if (this.curViewPort.eS > this.sound_handler_service.audioBuffer.length) {
      this.curViewPort.eS = this.sound_handler_service.audioBuffer.length;
    }
    // check if at least 4 samples are showing (fixed max zoom size)
    if (this.curViewPort.eS - this.curViewPort.sS < 4) {
      this.curViewPort.sS = oldStart;
      this.curViewPort.eS = oldEnd;
    }

  };


  /**
   * set view port to start and end sample
   * (with several out-of-bounds like checks)
   *
   * @param zoomIn bool to specify zooming direction
   * if set to true -> zoom in
   * if set to false -> zoom out
   */
  zoomViewPort(zoomIn) {
    let newStartS, newEndS;
    const d = this.curViewPort.eS - this.curViewPort.sS;

    if (this.getPreselectedItemInfo()) {
      let zoomAnchor;
      const preselectSegment = this.getPreselectedItemInfo().item;

      if (this.getCurrentMouseOverLevel().type === 'SEGMENT') {
        if (this.getPreselectedItemInfo().isLast) {
          zoomAnchor = preselectSegment.sampleStart + preselectSegment.sampleDur;
        } else {
          zoomAnchor = preselectSegment.sampleStart;
        }
      } else {
        zoomAnchor = preselectSegment.samplePoint;
      }
      let d1 = zoomAnchor - this.curViewPort.sS;
      let d2 = this.curViewPort.eS - zoomAnchor;

      if (zoomIn) {
        newStartS = this.curViewPort.sS + d1 * 0.5;
        newEndS = this.curViewPort.eS - d2 * 0.5;
      } else {
        newStartS = this.curViewPort.sS - d1 * 0.5;
        newEndS = this.curViewPort.eS + d2 * 0.5;
      }
    } else {
      if (zoomIn) {
        newStartS = this.curViewPort.sS + ~~(d / 4);
        newEndS = this.curViewPort.eS - ~~(d / 4);
      } else {
        newStartS = this.curViewPort.sS - ~~(d / 4);
        newEndS = this.curViewPort.eS + ~~(d / 4);

      }
    }
    this.setViewPort(newStartS, newEndS);
  };

  /**
   * moves view port to the right or to the left
   * without changing the zoom
   *
   * @param shiftRight bool to specify direction
   * if set to true -> shift right
   * if set to false -> shift left
   */
  public shiftViewPort(shiftRight) {
    // my.removeLabelDoubleClick();
    let newStartS, newEndS;
    if (shiftRight) {
      newStartS = this.curViewPort.sS + ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
      newEndS = this.curViewPort.eS + ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
    } else {
      newStartS = this.curViewPort.sS - ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
      newEndS = this.curViewPort.eS - ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
    }

    this.setViewPort(newStartS, newEndS);
  }


  /**
   * sets all the curLevelAttrDefs array
   * to hold the default attr. definitions
   * which are the same as the level names
   *
   * @param levelDefs level definitions from the DBconfig
   */
  setCurLevelAttrDefs(levelDefs) {
    levelDefs.forEach((ld) => {
      this.curLevelAttrDefs.push({
        'levelName': ld.name,
        'curAttrDefName': ld.name
      });
    });
  }

  // /**
  //  * set the current attribute definition name of the
  //  * given levelName
  //  *
  //  * @param levelName name of level
  //  * @param newAttrDefName
  //  * @param index index of attribute
  //  */
  // sServObj.setCurAttrDef = function (levelName, newAttrDefName, index) {
  //   angular.forEach(sServObj.curLevelAttrDefs, function (ad) {
  //     if (ad.levelName === levelName) {
  //       ad.curAttrDefName = newAttrDefName;
  //       ad.curAttrDefIndex = index;
  //     }
  //   });
  // };

  /**
   * get the current attribute definition name of the
   * given levelName
   *
   * @param levelName name of level
   * @returns attrDefName
   */
  getCurAttrDef(levelName): string {
    let curAttrDef;
    this.curLevelAttrDefs.forEach((ad) => {
      if (ad.levelName === levelName) {
        curAttrDef = ad.curAttrDefName;
      }
    });
    return curAttrDef;
  }

  // /**
  //  * get the current attribute definition index of the
  //  * given levelName
  //  *
  //  * @param levelName name of level
  //  * @returns attrDefName
  //  */
  // sServObj.getCurAttrIndex = function (levelName) {
  //   var curAttrDef;
  //   angular.forEach(sServObj.curLevelAttrDefs, function (ad) {
  //     if (ad.levelName === levelName) {
  //       if (ad.curAttrDefIndex === undefined) {
  //         curAttrDef = 0;
  //       } else {
  //         curAttrDef = ad.curAttrDefIndex;
  //       }
  //     }
  //   });
  //   return curAttrDef;
  // };
  //
  // sServObj.setlastKeyCode = function (e) {
  //   this.lastKeyCode = e;
  // };
  //
  /**
   *
   */
  getX(e) {
    return getMousePositionInCanvasX(e);
  }

  /**
   *
   */
  getY = function (e) {
    return getMousePositionInCanvasY(e);
  };

  /**
   *
   */
  public resetToInitState () {
    this.initialize();
  }

  // /**
  //  *
  //  */
  // sServObj.getColorOfAnchor = function (val, anchorNr) {
  //   var curStyle = {
  //     'background-color': 'rgb(' + val[anchorNr][0] + ',' + val[anchorNr][1] + ',' + val[anchorNr][2] + ')',
  //     'width': '10px',
  //     'height': '10px'
  //   };
  //   return (curStyle);
  // };
  //
  // sServObj.numberOfPages = function (sessionLength) {
  //   return Math.ceil(sessionLength / sServObj.pageSize);
  // };
  //
  // sServObj.switchPerspective = function (index, allPerspectives) {
  //   // @ todo check permission/state machine
  //   if (allPerspectives.length > index) {
  //     sServObj.curPerspectiveIdx = index;
  //   }
  // };
}
