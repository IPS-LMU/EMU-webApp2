import { Injectable } from '@angular/core';

import { ViewStateService } from './view-state.service';
import { ConfigProviderService } from './config-provider.service';
import { SsffDataService } from './ssff-data.service';
import { LevelService } from './level.service';
import {DataService} from './data.service';
import {LoadedMetaDataService} from './loaded-meta-data.service';
import {SoundHandlerService} from './sound-handler.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private view_state_service: ViewStateService,
              private config_provider_service: ConfigProviderService,
              private ssff_data_service: SsffDataService,
              private sound_handler_service: SoundHandlerService,
              private data_service: DataService,
              private loaded_meta_data_service: LoadedMetaDataService) { }

  movesAwayFromLastSave = 0;

  //////////////////////////////////////////
  // new dual stack implementation

  // private
  undoStack = [];
  redoStack = [];
  curChangeObj = {};

  // applyChanges should be called by undo redo functions
  private applyChange(changeObj, applyOldVal) {
    Object.keys(changeObj).forEach((key) => {
      let tr, col, action;
      let cur = changeObj[key];
      if (cur.type === 'SSFF') {
        if (applyOldVal) {
          this.setHistoryActionText(true, 'SSFF manipulation');
          tr = this.config_provider_service.getSsffTrackConfig(cur.trackName);
          col = this.ssff_data_service.getColumnOfTrack(tr.name, tr.columnName);
          col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
        } else {
          this.setHistoryActionText(false, 'SSFF manipulation');
          tr = this.config_provider_service.getSsffTrackConfig(cur.trackName);
          col = this.ssff_data_service.getColumnOfTrack(tr.name, tr.columnName);
          col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
        }
      } else if (cur.type === 'WEBAPP') {
        action = false;
        switch (cur.action) {
          case 'COMMENT':
            // The order of links is not preserved on undo
            if (applyOldVal) {
              action = true;
              this.loaded_meta_data_service.setBndlComment(cur.initial, cur.key, cur.index);
            } else {
              this.loaded_meta_data_service.setBndlComment(cur.comment, cur.key, cur.index);
            }
            break;
          case 'FINISHED':
            if (applyOldVal) {
              action = true;
              this.loaded_meta_data_service.setBndlFinished(!cur.finished, cur.key, cur.index);
            } else {
              this.loaded_meta_data_service.setBndlFinished(cur.finished, cur.key, cur.index);
            }
            break;
        }
        this.setHistoryActionText(action, cur.action);
      } else if (cur.type === 'ANNOT') {
        action = false;
        switch (cur.action) {
          case 'MOVEBOUNDARY':
            if (applyOldVal) {
              action = true;
              LevelService.moveBoundary(this.data_service.getLevelDataByName(cur.name), cur.id, -cur.movedBy, cur.isFirst, cur.isLast, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            } else {
              LevelService.moveBoundary(this.data_service.getLevelDataByName(cur.name), cur.id, cur.movedBy, cur.isFirst, cur.isLast, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            }
            break;
          case 'MOVESEGMENT':
            if (applyOldVal) {
              action = true;
              LevelService.moveSegment(this.data_service.getLevelDataByName(cur.name), cur.id, cur.length, -cur.movedBy, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            } else {
              LevelService.moveSegment(this.data_service.getLevelDataByName(cur.name), cur.id, cur.length, cur.movedBy, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            }
            break;
          case 'MOVEEVENT':
            if (applyOldVal) {
              action = true;
              LevelService.moveEvent(this.data_service.getLevelDataByName(cur.name), cur.id, -cur.movedBy, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            } else {
              LevelService.moveEvent(this.data_service.getLevelDataByName(cur.name), cur.id, cur.movedBy, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            }
            break;
          case 'RENAMELABEL':
            if (applyOldVal) {
              action = true;
              LevelService.renameLabel(this.data_service.getLevelDataByName(cur.name), cur.id, cur.attrIndex, cur.oldValue);
            } else {
              LevelService.renameLabel(this.data_service.getLevelDataByName(cur.name), cur.id, cur.attrIndex, cur.newValue);
            }
            break;
          /*
          case 'RENAMELEVEL':
            if (applyOldVal) {
              action = true;
              this.level_service.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
            } else {
              this.level_service.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
            }
            break;
          case 'DELETELEVEL':
            if (applyOldVal) {
              action = true;
              this.level_service.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
            } else {
              this.level_service.deleteLevel(cur.id, cur.curPerspectiveIdx);
            }
            break;
          */
          case 'DELETEBOUNDARY':
            if (applyOldVal) {
              action = true;
              LevelService.deleteBoundaryInvers(this.data_service.getLevelDataByName(cur.name), cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
            } else {
              LevelService.deleteBoundary(this.data_service.getLevelDataByName(cur.name), cur.id, cur.isFirst, cur.isLast);
            }
            break;
          case 'DELETESEGMENTS':
            if (applyOldVal) {
              action = true;
              LevelService.deleteSegmentsInvers(this.data_service.getLevelDataByName(cur.name), cur.id, cur.length, cur.deletedSegment, this.view_state_service.getCurAttrDef(cur.name));
            } else {
              LevelService.deleteSegments(this.data_service.getLevelDataByName(cur.name), cur.id, cur.length, this.view_state_service.getCurAttrDef(cur.name));
            }
            break;
          case 'DELETEEVENT':
            if (applyOldVal) {
              action = true;
              let attrDefs = this.config_provider_service.getLevelDefinition(cur.name).attributeDefinitions;
              LevelService.insertEvent(
                  this.data_service.getLevelDataByName(cur.name),
                  cur.start,
                  cur.pointName,
                  cur.id,
                  this.view_state_service.getCurAttrDef(cur.name),
                  this.config_provider_service.getLevelDefinition(cur.name).attributeDefinitions
              );
            } else {
              LevelService.deleteEvent(this.data_service.getLevelDataByName(cur.name), cur.id);
            }
            break;
          case 'DELETELINKSTO':
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.insertLinksTo(cur.deletedLinks);
            // } else {
            //   LinkService.deleteLinksTo(cur.id);
            // }
            break;
          case 'DELETELINKBOUNDARY':
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.deleteLinkBoundaryInvers(cur.deletedLinks);
            // } else {
            //   LinkService.deleteLinkBoundary(cur.id, cur.neighbourId, this.level_service);
            // }
            break;
          case 'DELETELINKSEGMENT':
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.deleteLinkSegmentInvers(cur.deletedLinks);
            // } else {
            //   LinkService.deleteLinkSegment(cur.segments);
            // }
            break;
          /*
          case 'INSERTLEVEL':
            if (applyOldVal) {
              action = true;
              this.level_service.deleteLevel(cur.id, cur.curPerspectiveIdx);
            } else {
              this.level_service.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
            }
            break;
          */
          case 'INSERTSEGMENTS':
            if (applyOldVal) {
              action = true;
              LevelService.insertSegmentInvers(this.data_service.getLevelDataByName(cur.name), cur.start, cur.end);
            } else {
              LevelService.insertSegment(
                  this.data_service.getLevelDataByName(cur.name),
                  cur.start,
                  cur.end,
                  cur.segName,
                  cur.ids,
                  this.view_state_service.getCurAttrDef(cur.name),
                  this.config_provider_service.getLevelDefinition(cur.name).attributeDefinitions
              );
            }
            break;
          case 'INSERTEVENT':
            if (applyOldVal) {
              action = true;
              LevelService.deleteEvent(this.data_service.getLevelDataByName(cur.name), cur.id);
            } else {
              LevelService.insertEvent(
                  this.data_service.getLevelDataByName(cur.name),
                  cur.start,
                  cur.pointName,
                  cur.id,
                  this.view_state_service.getCurAttrDef(cur.name),
                  this.config_provider_service.getLevelDefinition(cur.name).attributeDefinitions
              );
            }
            break;
          case 'INSERTLINKSTO':
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.deleteLinksTo(cur.parentID, cur.childIDs);
            // } else {
            //   LinkService.insertLinksTo(cur.parentID, cur.childIDs);
            // }
            break;
          case 'EXPANDSEGMENTS':
            if (applyOldVal) {
              action = true;
              LevelService.expandSegment(cur.rightSide, cur.item, this.data_service.getLevelDataByName(cur.name), -cur.changeTime, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            } else {
              LevelService.expandSegment(cur.rightSide, cur.item, this.data_service.getLevelDataByName(cur.name), cur.changeTime, this.view_state_service.getCurAttrDef(cur.name), this.sound_handler_service.audioBuffer.length);
            }
            break;
        }
        this.setHistoryActionText(action, cur.action);
      } else if (cur.type === 'HIERARCHY') {
        action = false;
        switch (cur.action) {
          case 'DELETELINK':
            // The order of links is not preserved on undo
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.insertLinkAt(cur.fromID, cur.toID, cur.position);
            // } else {
            //   LinkService.deleteLink(cur.fromID, cur.toID);
            // }
            break;

          case 'DELETEITEM':
            if (applyOldVal) {
              action = true;
              LevelService.deleteItemWithLinksInvers({level: this.data_service.getLevelDataByName(cur.levelName), item: cur.item}, cur.position, cur.deletedLinks, this.data_service.getLinkData());
            } else {
              LevelService.deleteItemWithLinks(this.data_service.getNodeInfo(cur.item.id), this.data_service.getLinkData());
            }
            break;

          case 'ADDITEM':
            if (applyOldVal) {
              action = true;
              LevelService.addItemInvers(cur.newID, this.data_service.getLevelData());
            } else {
              const siblingInfo = this.data_service.getNodeInfo(cur.neighborID);
              const attrDefs = this.config_provider_service.getLevelDefinition(siblingInfo.level.name).attributeDefinitions;
              LevelService.addItem(siblingInfo.item, siblingInfo.level, attrDefs, cur.before, cur.newID);
            }
            break;

          case 'ADDLINK':
            console.error('link service not implemented')
            // if (applyOldVal) {
            //   action = true;
            //   LinkService.deleteLink(cur.link.fromID, cur.link.toID);
            // } else {
            //   LinkService.insertLink(cur.link.fromID, cur.link.toID);
            // }
            break;

          case 'PUSHITEM':
            if (applyOldVal) {
              action = true;
              LevelService.addItemInvers(cur.newID, this.data_service.getLevelData());
            } else {
              LevelService.pushNewItem(
                this.data_service.getLevelDataByName(cur.level),
                this.config_provider_service.getLevelDefinition(cur.level).attributeDefinitions,
                cur.newID);
            }
            break;
        }
        this.setHistoryActionText(action, cur.action);
      }
    });
  }

  /////////////////////////////////////
  // public API

  /**
   *
   */
  public updateCurChangeObj (dataObj) {
    // console.log(dataObj);
    let dataKey;
    if (dataObj.type === 'SSFF') {
      dataKey = String(dataObj.type + '#' + dataObj.trackName) + '#' + String(dataObj.sampleBlockIdx) + '#' + String(dataObj.sampleIdx);
      // update curChangeObj
      if (!this.curChangeObj[dataKey]) {
        this.curChangeObj[dataKey] = dataObj;
      } else {
        dataObj.oldValue = this.curChangeObj[dataKey].oldValue;
        this.curChangeObj[dataKey] = dataObj;
      }
    } else if (dataObj.type === 'WEBAPP') {
      dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.key + '#' + dataObj.index);
      // update curChangeObj
      if (!this.curChangeObj[dataKey]) {
        this.curChangeObj[dataKey] = dataObj;
      } else {
        dataObj.comment = this.curChangeObj[dataKey].comment;
        this.curChangeObj[dataKey] = dataObj;
      }
    } else if (dataObj.type === 'ANNOT') {
      switch (dataObj.action) {
        case 'MOVEBOUNDARY':
        case 'MOVEEVENT':
        case 'MOVESEGMENT':
        case 'INSERTEVENT':
        case 'DELETEEVENT':
          dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name + '#' + dataObj.id);
          if (!this.curChangeObj[dataKey]) {
            this.curChangeObj[dataKey] = dataObj;
          } else {
            dataObj.movedBy += this.curChangeObj[dataKey].movedBy;
            this.curChangeObj[dataKey] = dataObj;
          }
          break;
        case 'INSERTLINKSTO':
        case 'DELETELINKSTO':
        case 'DELETELINKBOUNDARY':
        case 'DELETELINKSEGMENT':
        case 'DELETEBOUNDARY':
        case 'DELETESEGMENTS':
          dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name);
          if (!this.curChangeObj[dataKey]) {
            this.curChangeObj[dataKey] = dataObj;
          } else {
            dataObj.oldValue = this.curChangeObj[dataKey].oldValue;
            this.curChangeObj[dataKey] = dataObj;
          }

          break;
      }

    }
    return (this.curChangeObj);

  };

  // addCurChangeObjToUndoStack
  public addCurChangeObjToUndoStack () {
    // empty redo stack
    this.redoStack = [];
    // add to undoStack
    if (!(this.curChangeObj && (Object.keys(this.curChangeObj).length === 0))) {
      this.undoStack.push(this.curChangeObj);
      this.movesAwayFromLastSave += 1;
    }
    console.log(this.curChangeObj);
    // reset curChangeObj
    this.curChangeObj = {};

  }

  // addCurChangeObjToUndoStack
  public addObjToUndoStack (obj) {
    // empty redo stack
    this.redoStack = [];
    let tmpObj = {};
    let dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.id);
    tmpObj[dataKey] = JSON.parse(JSON.stringify(obj)); //angular.copy(obj);
    // add to undoStack
    if (!(tmpObj && (Object.keys(tmpObj).length === 0))) {
      this.undoStack.push(tmpObj);
      this.movesAwayFromLastSave += 1;
    }
    // reset curChangeObj
    this.curChangeObj = {};

  }

  // undo
  public undo () {
    if (this.undoStack.length > 0) {
      // add to redo stack
      let oldChangeObj = JSON.parse(JSON.stringify(this.undoStack[this.undoStack.length - 1])); // angular.copy();

      this.redoStack.push(oldChangeObj);
      this.applyChange(oldChangeObj, true);
      // remove old
      this.undoStack.pop();
      this.movesAwayFromLastSave -= 1;
    }
  }

  // redo
  public redo () {
    if (this.redoStack.length > 0) {
      let oldChangeObj = JSON.parse(JSON.stringify(this.redoStack[this.redoStack.length - 1])); //angular.copy();
      this.undoStack.push(oldChangeObj);
      this.applyChange(oldChangeObj, false);
      this.redoStack.pop();
      this.movesAwayFromLastSave += 1;
    }
  }

  // getNrOfPossibleUndos
  public getNrOfPossibleUndos () {
    return this.undoStack.length;
  }


  // return current History Stack
  public getCurrentStack () {
    return {
      'undo': this.undoStack,
      'redo': this.redoStack
    };
  }

  // set the displayed text of the historyActionPopup
  public setHistoryActionText (isUndo, text) {
    let front = '<i>UNDO</i> &#8594; ';
    if (!isUndo) {
      front = '<i>REDO</i> &#8592; ';
    }
    this.view_state_service.historyActionTxt = front + text;
  }

  // resetToInitState
  resetToInitState() {
    this.undoStack = [];
    this.redoStack = [];
    this.curChangeObj = {};
    this.movesAwayFromLastSave = 0;
  }
}
