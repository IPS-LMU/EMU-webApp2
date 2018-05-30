import { Injectable } from '@angular/core';

import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class LoadedMetaDataService {

  constructor(private validation_service: ValidationService) { }

  //////////////////////
  // private vars
  uniqSessionList: any = [];
  bundleList: any = [];
  curBndl: any = {};
  demoDbName: any = '';
  rendOptBndlList: any = {}; // render optimized bundle list

  //////////////////////
  // private functions

  private genUniqSessionList(bndlList) {
    let sList = [];
    let fistSes;
    bndlList.forEach((bndl, idx) => {
      sList[bndl.session] = {
        'collapsed': true
      };
      if (idx === 0) {
        fistSes = bndl.session;
      }
    });
    // open fist session up
    sList[fistSes].collapsed = false;
    return sList;
  }

  private genRendOptBndlList(bndlList) {
    bndlList.forEach((bndl) => {
      if (this.rendOptBndlList[bndl.session] === undefined) {
        this.rendOptBndlList[bndl.session] = [];
      }
      this.rendOptBndlList[bndl.session].push(bndl);
    });
    return this.rendOptBndlList;
  }

  //////////////////////
  //////////////////////
  // public API

  ///////////////
  // bundleList

  /**
   * setter for bundleList
   * @returns validation result for bundle list
   */
  setBundleList(bList) {
    // validate
    let validRes = this.validation_service.validateJSO('bundleListSchema', bList);
    if (validRes === true) {
      // set
      this.bundleList = bList;
      // generate uniqSessionList
      this.uniqSessionList = this.genUniqSessionList(this.bundleList);
      // generate render optimized bundlList
      this.rendOptBndlList = this.genRendOptBndlList(this.bundleList);
    }
    return validRes;
  };

  /**
   * getter for bundleList
   */
  getBundleList() {
    return this.bundleList;
  }

  /**
   * getter for rendOptBndlList
   */
  getRendOptBndlList() {
    return this.rendOptBndlList;
  }

  ///////////
  // curBndl

  /**
   * getter curBndl
   */
  getCurBndl() {
    return this.curBndl;
  }

  /**
   * setter curBndl
   */
  setCurBndl(bndl) {
    this.curBndl = bndl;
  }

  /**
   * remove BndlComment
   */
  setBndlComment(comment, key, index) {
    this.rendOptBndlList[key][index].comment = comment;
  }

  /**
   * setter BndlFinished
   */
  setBndlFinished(finished, key, index) {
    this.rendOptBndlList[key][index].finishedEditing = finished;
  }


  /**
   * getter curBndl name
   */
  getCurBndlName() {
    return this.curBndl.name;
  }

  /**
   * setter curBndl name
   */
  setCurBndlName(name) {
    this.curBndl.name = name;
  }

  ///////////
  // timeAnchors

  /**
   * setter timeAnchors
   */
  setTimeAnchors(timeAnchors) {
    this.curBndl.timeAnchors = timeAnchors;
  };



  //////////////
  // demoDbName

  /**
   * setter demoDbName
   */
  setDemoDbName(name) {
    this.demoDbName = name;
  }

  /**
   * getter demoDbName
   */
  getDemoDbName() {
    return this.demoDbName;
  };


  ///////////////////
  // uniqSessionList

  /**
   *
   */
  toggleCollapseSession(session) {
    // console.log(session);
    if(this.uniqSessionList[session] === undefined) {
      this.uniqSessionList[session] = {};
    }
    this.uniqSessionList[session].collapsed = !this.uniqSessionList[session].collapsed;
    // close all other sessions
    Object.keys(this.uniqSessionList).forEach(function (key) {
      if (key !== session) {
        this.uniqSessionList[key].collapsed = true;
      }
    });
  }

  openCollapseSession(session) {
    // console.log(session);
    this.uniqSessionList[session] = {};
    this.uniqSessionList[session].collapsed = false;
    // close all other sessions
    Object.keys(this.uniqSessionList).forEach(function (key) {
      if (key !== session) {
        this.uniqSessionList[key].collapsed = true;
      }
    });
  }

  /**
   *
   */
updateCollapseSessionState(text) {
    this.getBundleList().forEach((bundle) => {
  		if (bundle.name.indexOf(text)) {
  			this.uniqSessionList[bundle.session].collapsed = false;
  		} else {
  			this.uniqSessionList[bundle.session].collapsed = true;
  		}
  	});
  }

  /**
   *
   */
  getSessionCollapseState(session) {
    if(this.uniqSessionList[session] === undefined) {
      return undefined;
    }
    else {
      return this.uniqSessionList[session].collapsed;
    }
  }


  ///////////////////
  // other functions

  /**
   * reset all private vals to init state
   */
  resetToInitState() {
    this.uniqSessionList = [];
    this.bundleList = [];
    this.curBndl = {};
    this.rendOptBndlList = {};
  };

}
