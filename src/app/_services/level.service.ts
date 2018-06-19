import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { ConfigProviderService } from './config-provider.service';
import { SoundHandlerService } from './sound-handler.service';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';
// import { LinkS}

@Injectable({
  providedIn: 'root'
})
export class LevelService {

  constructor(private data_service: DataService,
              private config_provider_service: ConfigProviderService,
              private sound_handler_service: SoundHandlerService) { }

  lasteditArea: string = null; // holding current edit area
  lasteditAreaElem: HTMLElement = null; // holding current edit area element

  /**
   * search for the according label field in labels
   * and return its position
   *    @param attrDefName
   *    @param labels
   */
  private getLabelIdx(attrDefName, labels) {
    let labelIdx;
    labels.forEach((l, idx) => {
      if (l.name === attrDefName) {
        labelIdx = idx;
      }
    });
    return labelIdx;
  }

  /**
   * returns all levels with details for a specific type
   *    @param types
   */
  public getLevelsByType(types) {
    let levels = [];
    this.data_service.getLevelData().forEach((level) => {
      if (types.indexOf(level.type) >= 0) {
        levels.push(level);
      }
    });
    return levels;
  }

  /**
   * gets element position inside a given level
   * by passing in the element id
   *    @param level
   *    @param id
   */
  public getOrderById(level: ILevel, id) {
    let ret = null;
    level.items.forEach(function (e, num) {
      if (e.id === id) {
        ret = num;
      }
    });
    return ret;
  }

  /**
   * gets element id inside a given level by
   * passing in the element position/order
   *    @param level
   *    @param order
   */
  public getIdByOrder(level: ILevel, order) {
    let ret = null;
    level.items.forEach(function (element, num) {
      if (num === order) {
        ret = element.id;
      }
    });
    return ret;
  }

  /**
   * get next element of element with id in order/position
   * inside a given level
   *    @param level
   *    @param id
   */
  getNextItem(level: ILevel, id) {
    let ret = null;
    level.items.forEach(function (element, num) {
      if (element.id === id) {
        ret = level.items[num + 1];
      }
    });
    return ret;
  }

  /**
   * get next or prev Element in time inside a given level
   * after or bevore (boolean) an element with 'id'
   *    @param level
   *    @param id
   *    @param after
   */
  public getItemInTime(level: ILevel, id, after) {
    let ret = null;
    let timeDifference = Infinity;
    let startItem = this.getItemFromLevelById(level, id);
    if (startItem !== null) {
      let myStart = startItem.sampleStart || startItem.samplePoint;
        level.items.forEach(function (element) {
          let start = element.sampleStart || element.samplePoint;
          if (after) {
            if (start > myStart && start - myStart <= timeDifference) {
              timeDifference = start - myStart;
              ret = element;
            }
          }
          else {
            if (start < myStart && myStart - start <= timeDifference) {
              timeDifference = myStart - start;
              ret = element;
            }
          }
        });
    }
    return ret;
  }

  /**
   * returns item from a given level by passing in the item 'id'
   *    @param level
   *    @param id
   */
  public getItemFromLevelById(level: ILevel, id): IItem {
    let ret = null;
    level.items.forEach(function (element) {
      if (element.id === id){
        ret = element;
      }
    });
    return ret;
  }


  /**
   * get all labels (curAttr def applies) of a level and
   * return them as a flat array
   * @param level containing labels
   * @return array containing all labels (form==['x','y','z'])
   */
  public getAllLabelsOfLevel(level: ILevel, curAttrDef: string) {
    let labels = [];
    level.items.forEach((item) => {
      let pos = item.labels.map(function (e) {
        return e.name;
      }).indexOf(curAttrDef);
      if (pos >= 0) {
        labels.push(item.labels[pos].value);
      }
    });
    return labels;
  }

  /**
   * returns level name of a given node id
   * @param nodeID id of the node
   * @return name of the containing level
   */
  public getLevelName(nodeID) {
    let ret = null;
    this.data_service.getLevelData().forEach((level) => {
      let pos = level.items.map(function (e) {
        return e.id;
      }).indexOf(nodeID);
      if (pos >= 0) {
        ret = level.name;
      }
    });
    return ret;
  }

  /**
   * Returns a level object and an item object according to a given item id
   * @param nodeID id of the node
   * @return object with level and item
   */
  public getLevelAndItem(nodeID) {
    let name = this.getLevelName(nodeID);
    if (name !== null) {
      return {level: this.data_service.getLevelDataByName(name), item: this.getItemByID(nodeID)};
    }
    else {
      return null;
    }
  }

  /**
   * Returns an item with a given id
   * @param nodeID id of the node
   * @return item with id
   */
  public getItemByID(nodeID) {
    let ret;
    this.data_service.getLevelData().forEach((level) => {
      let pos = level.items.map(function (e) {
        return e.id;
      }).indexOf(nodeID);
      if (pos >= 0) {
        ret = level.items[pos];
      }
    });
    return ret;
  }

  /**
   * returns multiple item(s) from a given level by passing in
   * the start item 'id' and the length (how many objects to return)
   *    @param level
   *    @param id
   *    @param length
   */
  public getItemsFromLevelByIdAndLength(level: ILevel, id, length) {
    let ret = [];
    let lastID = id;
    for (let j = 0; j < length; j++) {
      let segment = this.getItemFromLevelById(level, lastID);
      lastID = this.getNextItem(level, segment.id);
      ret.push(segment);
    }
    return ret;
  }

  /**
   * Getter for last edit Area Element
   *   @return lasteditAreaElem last edit Area Element
   */
  public getlasteditAreaElem () {
    return this.lasteditAreaElem;
  }

  /**
   * Setter for last edit Area Element
   *   @param e lasteditAreaElem last edit Area Element
   */
  public setlasteditAreaElem (e: HTMLElement) {
    this.lasteditAreaElem = e;
  }

  /**
   * Setter for last edit Area
   *   @param name lasteditAreaElem last edit Area
   */
  public setlasteditArea (name: string) {
    this.lasteditArea = name;
  }

  /**
   * Getter for last edit Area
   *   @return lasteditAreaElem last edit Area
   */
  public getlasteditArea () {
    return this.lasteditArea;
  }

  /**
   * Getter for id of last edited Element
   *   @return lasteditAreaElem last edit Area
   */
  public getlastID () {
    return parseInt(this.lasteditArea.substr(1));
  }

  /**
   * Remove currently open html textarea (if there is a textarea open)
   * and set this.view_state_service.editing to false.
   */
  public deleteEditArea() {
    // if (null !== this.getlasteditArea()) {
    //   $('.' + this.getlasteditArea()).remove();
    // }

    /*
    @todo the viewState must be handled elsewhere
    this.view_state_service.editing = false;
    // close large text input field
    this.view_state_service.largeTextFieldInputFieldCurLabel =  '';
    this.view_state_service.largeTextFieldInputFieldVisable = false;
    */
  }

  /**
   * Calculate values (x,y,width,height) for textarea to open
   * depending on the current Level type, the current canvas
   * and the current clicked Element
   *   @param lastEventClick the current clicked Level Element
   *   @param element the current html Element to get canvas from
   *   @param type the current Level type
   */
  public openEditArea = function (lastEventClick, element, type) {
    let levelName = this.view_state_service.getcurClickLevelName();
    let attrDefName = this.view_state_service.getCurAttrDef(levelName);

    // find labelIdx
    let labelIdx = this.getLabelIdx(attrDefName, lastEventClick.labels);

    let elem = element.querySelectorAll('canvas')[0];
    let clientWidth = elem.clientWidth;
    let clientOffset = elem.offsetLeft;
    let top = elem.offsetTop;
    let height = elem.clientHeight - 1;
    let len = 10;
    let start, end, width;
    if (labelIdx !== undefined) {
      if (lastEventClick.labels[labelIdx].value.length > 0) {
        len = lastEventClick.labels[labelIdx].value.length * 7;
      }
    }
    let editText = '';
    if (lastEventClick.labels.length > 0) {
      if (lastEventClick.labels[labelIdx] !== undefined) {
        editText = lastEventClick.labels[labelIdx].value;
      }
      else {
        editText = '';
      }
    }
    if(!this.config_provider_service.vals.restrictions.useLargeTextInputField){
      if (type === 'SEGMENT') {
        start = Math.floor(this.view_state_service.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset);
        end = Math.ceil(this.view_state_service.getPos(clientWidth, (lastEventClick.sampleStart + lastEventClick.sampleDur + 1)) + clientOffset);
        this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);

        /*
              zooming in disabled

                          if (width < (2 * len)) {
                              let zoom = this.view_state_service.curViewPort.eS - this.view_state_service.curViewPort.sS;
                              if (zoom <= 10) { // if already zoomed in but text is still too long
                                  this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);
                              }
                              else {
                                  this.view_state_service.zoomViewPort(true, this);
                                  this.openEditArea(lastEventClick, element, type);
                                  return;
                              }
                          }
          */
      } else {
        start = this.view_state_service.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset - (len / 2);
        end = this.view_state_service.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset + (len / 2);
        width = end - start;
        if (width < (2 * len)) {
          width = (2 * len);
        }
        this.createEditAreaElement(element, start, top, width, height, editText, lastEventClick.id);
      }
      this.createSelection(element.querySelectorAll('textarea')[0], 0, editText.length);
    }else{
      this.view_state_service.largeTextFieldInputFieldVisable = true;
      this.view_state_service.largeTextFieldInputFieldCurLabel =  editText;
    }
  };

  /**
   * Create a Text Selection in a html Textarea
   *   @param field the textarea element
   *   @param start the starting character position as int
   *   @param end the ending character position as int
   */
  public createSelection (field: HTMLTextAreaElement, start, end) {
    if (field.createTextRange) {
      let selRange: {collapse, moveStart, moveEnd, select} = field.createTextRange();
      selRange.collapse(true);
      selRange.moveStart('character', start);
      selRange.moveEnd('character', end);
      selRange.select();
    } else if (field.setSelectionRange) {
      field.setSelectionRange(start, end);
    } else if (field.selectionStart) {
      field.selectionStart = start;
      field.selectionEnd = end;
    }
    field.focus();
  }

  /**
   * create a html textarea element at given
   * @param element to prepend textarea to
   * @param x the x Position
   * @param y the y Position
   * @param width the Width
   * @param height the Height
   * @param label the Text Content of the Textarea
   * @param labelid the id of the element
   */
  public createEditAreaElement (element, x, y, width, height, label, labelid) {
    let textid = '_' + labelid;
    let cssObj = {
      'left': Math.round(x + 2) + 'px',
      'top': Math.round(y + 1) + 'px',
      'width': Math.round(width) - 2 + 'px',
      'height': Math.round(height) - 20 + 'px',
      'padding-top': Math.round(height / 3 + 1) + 'px'
    };
    // add custom label font to CSS if specified
    /*
     @todo just remove this freaking custom font stuff
    if(typeof this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily !== 'undefined'){
      cssObj['font-family'] = this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily;
    }
    */
    console.error("should prepend texarea");
    // element.prepend($('<textarea>').attr({
    //   id: textid,
    //   'class': textid + ' emuwebapp-label-edit',
    //   'ng-model': 'message',
    //   'autofocus': 'true'
    // }).css(cssObj).text(label));
  }

  /**
   * insert a new Item with id labelname start and duration at position on level
   */
  public insertItemDetails (id, level: ILevel, position, labelname, start, duration, curAttrDef: string) {
    let attrdefs = this.config_provider_service.getLevelDefinition(level.name).attributeDefinitions;
    let newElement;
    if (attrdefs === undefined) { // ugly hack if attrdefs undefined
      attrdefs = [];
    }
    if (level.type === 'SEGMENT') {
      newElement = {
        id: id,
        sampleStart: start,
        sampleDur: duration,
        labels: []
      };
      if (attrdefs.length > 0) {
        for (let i = 0; i < attrdefs.length; i++) {
          if (attrdefs[i].name === curAttrDef) {
            newElement.labels.push({
              name: attrdefs[i].name,
              value: labelname
            });
          } else {
            newElement.labels.push({
              name: attrdefs[i].name,
              value: labelname
            });
          }
        }
      }
      else {
        newElement.labels.push({
          name: level.name,
          value: labelname
        });
      }
    } else if (level.type === 'EVENT') {
      if (start !== undefined) {
        newElement = {
          id: id,
          samplePoint: start,
          labels: []
        };
      }
      else {
        newElement = {
          id: id,
          labels: []
        };
      }
      if (attrdefs.length > 0) {
        for (let i = 0; i < attrdefs.length; i++) {
          if (attrdefs[i].name === curAttrDef) {
            newElement.labels.push({
              name: attrdefs[i].name,
              value: labelname
            });
          } else {
            newElement.labels.push({
              name: attrdefs[i].name,
              value: labelname
            });
          }
        }
      }
      else {
        newElement.labels.push({
          name: level.name,
          value: labelname
        });
      }
    }
    level.items.splice(position, 0, newElement);
  };

  /**
   * sets element details by passing in level and elemtent id
   */
  public updateSegment (level: ILevel, id, labelname, labelIdx, start, duration) {
    level.items.forEach(function (element) {
      if (element.id === id) {
        if (start !== undefined) {
          element.sampleStart = start;
        }
        if (duration !== undefined) {
          element.sampleDur = duration;
        }
        if (labelname !== undefined) {
          element.labels[labelIdx].value = labelname;
        }
      }
    });
  };

  /**
   * sets element details by passing in level and elemtent id
   */
  public updatePoint (level: ILevel, id, labelname, labelIdx, start) {
    level.items.forEach((element) => {
      if (element.id === id) {
        element.samplePoint = start;
        if (labelIdx === undefined) {
          element.labels[0].value = labelname;
        }
        else {
          element.labels[labelIdx].value = labelname;
        }
      }
    });
  };

  /**
   * gets item details by passing in level and item id's
   */
  public getItemNeighboursFromLevel (level: ILevel, firstid, lastid) {
    let left;
    let right;
    level.items.forEach(function (itm, num) {
      if (itm.id === firstid) {
        left = level.items[num - 1];
      }
      if (itm.id === lastid) {
        right = level.items[num + 1];
      }
    });
    return {
      left: left,
      right: right
    };
  };

  /**
   * get item details by passing in level, sampleNr and maximum pcm
   *
   * @param level
   * @param sampleNr
   * @param maximum
   * @returns object of the form {current: item, nearest: item, isFirst: boolean, isLast: boolean} where
   * - current is the actual item where the mouse is
   * - nearest is the item next to the current one depending on where the mouse is (ie if over 50% right element, under 50% left element)
   * - isFirst is true if the mouse is before the first item
   * - isLast is true if the mouse is after the last item
   *
   */
  getClosestItem (sampleNr, level: ILevel, maximum) {
    let current;
    let nearest;
    let isFirst;
    let isLast;


    if (level !== undefined && level !== null && level.items.length > 0) {
      current = nearest = level.items[0];
      isFirst = true;
      isLast = false;
      if (level.type === 'SEGMENT') {
        let leftHalf; // boolean to specify which half of the segment sampleNr is in
        level.items.forEach((itm, index) => {
          // check if in current segment
          if (sampleNr >= (itm.sampleStart - 0.5)) { // 0.5 sample correction
            if (sampleNr <= (itm.sampleStart + itm.sampleDur + 0.5)) { // 0.5 sample correction
              // check if in left or right half of segment
              if (sampleNr - itm.sampleStart >= itm.sampleDur / 2) {
                // right side
                leftHalf = false;
                if (level.items[index + 1] !== undefined) {
                  current = level.items[index];
                  nearest = level.items[index + 1];
                  isLast = false;
                } else {
                  isLast = true;
                  current = nearest = level.items[level.items.length - 1];
                }
              } else {
                // left side
                leftHalf = true;
                isLast = false;
                current = nearest = level.items[index];
              }
            }
            // only set to false if not in left half of first segment
            if(!leftHalf && index === 0){
              isFirst = false;
            }
          }
          if (sampleNr >= (itm.sampleStart - 0.5)) {
            if (sampleNr <= (itm.sampleStart + itm.sampleDur + 0.5)) { // 0.5 sample correction
              current = itm;
            } else {
              isLast = true;
              current = nearest = level.items[level.items.length - 1];
            }
          }
        });
      } else {
        let spaceLower = 0;
        let spaceHigher = 0;
        isFirst = false;
        isLast = false;
        level.items.forEach((evt, index) => {
          if (index < level.items.length - 1) {
            spaceHigher = evt.samplePoint + (level.items[index + 1].samplePoint - level.items[index].samplePoint) / 2;
          } else {
            spaceHigher = maximum;
          }
          if (index > 0) {
            spaceLower = evt.samplePoint - (level.items[index].samplePoint - level.items[index - 1].samplePoint) / 2;
          } else {
            spaceLower = 0;
          }
          if (sampleNr <= spaceHigher && sampleNr >= spaceLower) {
            current = nearest = evt;
          }
        });
      }
    }
    return {
      current: current,
      nearest: nearest,
      isFirst: isFirst,
      isLast: isLast
    };
  }

  /**
   * deletes a level by its index
   */
  /*
  public deleteLevel (levelIndex, curPerspectiveIdx) {
    let lvl = this.data_service.getLevelDataAt(levelIndex);
    this.data_service.deleteLevelDataAt(levelIndex);
    this.config_provider_service.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 1);
    return lvl;
  };
  */
  /**
   * adds a level by its name
   */
  /*
  public insertLevel (originalLevel, levelIndex, curPerspectiveIdx) {
    if (this.data_service.getLevelData() === undefined) {
      this.data_service.setLevelData([]);
    }
    this.data_service.insertLevelDataAt(levelIndex, originalLevel);
    this.config_provider_service.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 0, originalLevel.name);
  };
  */

  /**
   * rename the label of an element by passing in level and id
   */
  public renameLabel (level: ILevel, id, attrIndex, newLabelName) {
    this.updateSegment(level, id, newLabelName, attrIndex, undefined, undefined);
  };

  /**
   * rename a level by passing in old and new level name and perspective id
   */
  /*
  public renameLevel (oldname, newname, curPerspectiveIdx) {
    //rename level name
    this.data_service.getLevelData().forEach((level) => {
      if (level.name === oldname) {
        level.name = newname;
        this.view_state_service.curLevelAttrDefs.forEach((def, i) => {
          if (def.curAttrDefName === oldname && def.levelName === oldname) {
            this.view_state_service.curLevelAttrDefs.slice(i, 1);
          }
        });
        this.view_state_service.curLevelAttrDefs.push({curAttrDefName: newname, levelName: newname});
        // rename all first label names to match new
        level.items.forEach((item) => {
          item.labels[0].name = newname;
        });
      }
    });
    // update order name as well
    // @todo this has to change all perspectives, not only the current one
    this.config_provider_service.vals.perspectives[curPerspectiveIdx].levelCanvases.order[this.config_provider_service.vals.perspectives[curPerspectiveIdx].levelCanvases.order.indexOf(oldname)] = newname;
  };
  */

  /**
   *
   */
  public deleteSegmentsInvers (level: ILevel, id, length, deletedSegment, attrDefName: string) {
    let labelIdx;
    let x, insertPoint;
    insertPoint = 0;
    insertPoint = deletedSegment.order;
    for (x in deletedSegment.segments) {
      level.items.splice(insertPoint++, 0, deletedSegment.segments[x]);
    }
    let lastNeighbours = this.getItemNeighboursFromLevel(level, deletedSegment.segments[0].id, deletedSegment.segments[deletedSegment.segments.length - 1].id);

    if ((lastNeighbours.left !== undefined) && (lastNeighbours.right === undefined)) {
      labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.left.labels);
      this.updateSegment(level, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeRight));
    } else if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
      labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.right.labels);
      this.updateSegment(level, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeLeft), (lastNeighbours.right.sampleDur - deletedSegment.timeLeft));
    } else if ((lastNeighbours.left === undefined) && (lastNeighbours.right === undefined)) {

    } else {
      labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.left.labels);
      this.updateSegment(level, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeLeft));
      this.updateSegment(level, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeRight), (lastNeighbours.right.sampleDur - deletedSegment.timeRight));
    }
  };

  /**
   *
   */
  public deleteSegments (level: ILevel, id, length, attrDefName: string) {
    let firstSegment = this.getItemFromLevelById(level, id);
    let firstOrder = this.getOrderById(level, id);
    let lastSegment = level.items[firstOrder + length - 1];
    let neighbours = this.getItemNeighboursFromLevel(level, firstSegment.id, lastSegment.id);
    let timeLeft = 0;
    let timeRight = 0;
    let deleteOrder = null;
    let deletedSegment = null;
    let clickSeg = null;
    let labelIdx = this.getLabelIdx(attrDefName, firstSegment.labels);

    for (let i = firstOrder; i < (firstOrder + length); i++) {
      timeLeft += level.items[i].sampleDur + 1;
    }
    if (timeLeft % 2 === 0) {
      timeLeft = timeLeft / 2;
      timeRight = timeLeft;
    } else {
      timeLeft = Math.ceil(timeLeft / 2);
      timeRight = timeLeft - 1;
    }
    level.items.forEach((evt, order) => {
      if (evt.id === id) {
        deleteOrder = order;
        deletedSegment = level.items.splice(deleteOrder, length);
      }
    });

    if ((neighbours.left !== undefined) && (neighbours.right === undefined)) {
      this.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeRight));
      clickSeg = neighbours.left;
    } else if ((neighbours.left === undefined) && (neighbours.right !== undefined)) {
      this.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeLeft, (neighbours.right.sampleDur + timeLeft));
      clickSeg = neighbours.right;
    } else if ((neighbours.left === undefined) && (neighbours.right === undefined)) {
      // nothing left to do level empty now
      /*
      @todo the viewState must be handled elsewhere - probably as an @Output in LevelComponent
      this.view_state_service.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
      */
    } else {
      this.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeLeft));
      this.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeRight, (neighbours.right.sampleDur + timeRight));
      clickSeg = neighbours.left;
    }
    return {
      order: deleteOrder,
      segments: deletedSegment,
      timeLeft: timeLeft,
      timeRight: timeRight,
      clickSeg: clickSeg
    };
  };

  /**
   *
   */
  public insertSegmentInvers (level: ILevel, start, end) {
    let ret = true;
    let diff, diff2, startOrder;
    if (start === end) {
      startOrder = -1;
      level.items.forEach((evt, order) => {
        if (start === evt.sampleStart) {
          startOrder = order;
          ret = true;
        }
      });
      if (ret) {
        diff = 0;
        if (level.items[startOrder] !== undefined) {
          diff = level.items[startOrder].sampleDur + 1;
        }
        if (level.items[startOrder - 1] !== undefined) { // if not leftmost item
          level.items[startOrder - 1].sampleDur += diff;
        }
        level.items.splice(startOrder, 1);
      }
    } else {
      startOrder = -1;
      level.items.forEach((evt, order) => {
        if (start === evt.sampleStart) {
          startOrder = order;
          ret = true;
        }
      });
      if (ret) {
        if (level.items[startOrder + 1] === undefined) { // if rightmost item
          level.items.splice(startOrder - 1, 2);
        } else if (level.items[startOrder - 1] === undefined) { // if leftmost item
          level.items.splice(startOrder, 2);
        } else { // in the middle
          diff = level.items[startOrder].sampleDur + 1;
          diff2 = level.items[startOrder + 1].sampleDur + 1;
          level.items[startOrder - 1].sampleDur += (diff + diff2);
          level.items.splice(startOrder, 2);
        }
      }
    }
    return ret;
  }

  /**
   *
   */
  public insertSegment (level: ILevel, start, end, newLabel, ids, curAttrDef: string) {
    let ret = true;
    let diff, diff2, startID, endID;
    if (start === end) {
      if (level.items.length === 0) { // if on an empty level
        return {
          ret: false,
          ids: ids
        };
      } else { // if not on an empty level
        if (ids === undefined) {
          ids = [];
          ids[0] = this.data_service.getNewId();
        }
        startID = -1;
        if (start < level.items[0].sampleStart) { // before first segment
          diff = level.items[0].sampleStart - start;
          this.insertItemDetails(ids[0], level, 0, newLabel, start, diff - 1, curAttrDef);
        } else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
          let newStart = (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur + 1);
          this.insertItemDetails(ids[0], level, level.items.length, newLabel, newStart, start - newStart, curAttrDef);
        }
        else {
          level.items.forEach((evt, id) => {
            if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
              startID = id;
            }
            if (evt.sampleStart === start) {
              ret = false;
            }
            if (evt.sampleStart + evt.sampleDur + 1 === start) {
              ret = false;
            }
          });
          if (ret) {
            diff = start - level.items[startID].sampleStart - 1;
            this.insertItemDetails(ids[0], level, startID + 1, newLabel, start, level.items[startID].sampleDur - diff - 1, curAttrDef);
            level.items[startID].sampleDur = diff;
          }
        }
      }
    } else {
      if (ids === undefined) {
        ids = [];
        ids[0] = this.data_service.getNewId();
        ids[1] = this.data_service.getNewId();
      }
      if (level.items.length === 0) { // if on an empty level
        this.insertItemDetails(ids[0], level, 0, newLabel, start, (end - start) - 1, curAttrDef);
      } else { // if not on an empty level
        if (end < level.items[0].sampleStart) { // before first segment
          diff = level.items[0].sampleStart - end - 1;
          diff2 = end - start - 1;
          this.insertItemDetails(ids[0], level, 0, newLabel, end, diff, curAttrDef);
          this.insertItemDetails(ids[1], level, 0, newLabel, start, diff2, curAttrDef);

        } else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
          diff = start - (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur) - 1;
          diff2 = end - start - 1;
          let len = level.items.length;
          this.insertItemDetails(ids[0], level, len, newLabel, (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur), diff, curAttrDef);
          this.insertItemDetails(ids[1], level, len + 1, newLabel, start, diff2, curAttrDef);
        } else { // in the middle
          startID = -1;
          endID = -1;
          level.items.forEach((evt, id) => {
            if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
              startID = id;
            }
            if (end >= evt.sampleStart && end <= (evt.sampleStart + evt.sampleDur)) {
              endID = id;
            }
          });
          ret = (startID === endID);
          if (ret && startID !== -1) {
            diff = start - level.items[startID].sampleStart - 1;
            diff2 = end - start - 1;
            this.insertItemDetails(ids[0], level, startID + 1, newLabel, start, diff2, curAttrDef);
            this.insertItemDetails(ids[1], level, startID + 2, newLabel, end, level.items[startID].sampleDur - diff - 1 - diff2 - 1, curAttrDef);
            level.items[startID].sampleDur = diff;
          }
        }
      }
    }
    return {
      ret: ret,
      ids: ids
    };
  }

  /**
   *
   */
  public insertEvent (level: ILevel, start, pointName, id, curAttrDef: string) {
    let alreadyExists = false;
    let pos;
    let last;
    if (level.type === 'EVENT') {
      if (level.items.length > 0) {
        last = level.items[0].samplePoint;
      }
      else {
        last = 0;
      }
      level.items.forEach((evt, order) => {
        if (Math.floor(start) === Math.floor(evt.samplePoint)) {
          alreadyExists = true;
        }
        if (start > evt.samplePoint) {
          pos = order + 1;
        }
      });
    }
    if (!alreadyExists) {
      if (id === undefined) {
        id = this.data_service.getNewId();
      }
      this.insertItemDetails(id, level, pos, pointName, start, undefined, curAttrDef);
    }
    return {
      alreadyExists: alreadyExists,
      id: id
    };
  };

  /**
   *
   */
  public deleteEvent (level: ILevel, id) {
    let ret = false;
    if (level.type === 'EVENT') {
      level.items.forEach((evt, order) => {
        if (!ret) {
          if (id === evt.id) {
            ret = evt;
            level.items.splice(order, 1);
          }
        }
      });
    }
    return ret;
  };

  /**
   *   delete a single boundary between items
   */
  public deleteBoundary (level: ILevel, id, isFirst, isLast) {
    let toDelete = this.getItemFromLevelById(level, id);
    let last: IItem = null;
    let retOrder = null;
    let retEvt = null;
    let clickSeg = null;

    last = level.items[0];
    level.items.forEach((evt, order) => {
      if (level.type === 'SEGMENT') {
        if (toDelete.sampleStart === evt.sampleStart && toDelete.sampleDur === evt.sampleDur) {
          if (order === 0 && isFirst) {
            level.items.splice(order, 1);
            retOrder = order;
            retEvt = evt;
            clickSeg = level.items[0];
          }
          else if (order === (level.items.length - 1) && isLast) {
            level.items.splice(order, 1);
            retOrder = order;
            retEvt = evt;
            clickSeg = level.items[level.items.length - 1];
          }
          else {
            for (let i = 0; i < last.labels.length; i++) {
              last.labels[i].value += evt.labels[i].value;
            }
            last.sampleDur += evt.sampleDur + 1;
            level.items.splice(order, 1);
            retOrder = order;
            retEvt = evt;
            clickSeg = last;
          }
        }
      }
      last = evt;
    });
    if (clickSeg === null) {
      clickSeg = level.items[0];
    }

    return {
      order: retOrder,
      event: retEvt,
      clickSeg: clickSeg
    };
  }

  /**
   *   restore a single boundary between items
   */
  public deleteBoundaryInvers (level: ILevel, id, isFirst, isLast, deletedSegment) {
    level.items.splice(deletedSegment.order, 0, deletedSegment.event);
    let oldName = deletedSegment.event.labels[0].value;
    if (!isFirst && !isLast) {
      oldName = level.items[deletedSegment.order - 1].labels[0].value.slice(0, (level.items[deletedSegment.order - 1].labels[0].value.length - deletedSegment.event.labels[0].value.length));
      level.items[deletedSegment.order - 1].labels[0].value = oldName;
      level.items[deletedSegment.order - 1].sampleDur -= (deletedSegment.event.sampleDur + 1);
    }
  }

  /*
   @todo snapBoundary is faulty. To determine a level's neighbor, it looks for the level's neighbors in the annotation instead of the neighbors in the perspective.
   Anyway, neither of these neighbors can be determined without a dependency. The caller should pass in the neighbors.
  snapBoundary (toTop, levelName: string, segment, neighbor, type, curAttrDef: string) {
    let neighTd;
    let absMinDist = Infinity;
    let absDist;
    let minDist;
    let sample;
    let sampleTarget;
    if (type === 'SEGMENT') {
      sample = segment.sampleStart;
    } else if (type === 'EVENT') {
      sample = segment.samplePoint;
    }

    this.data_service.getLevelData().forEach((thisTd, tIdx) => {
      if (thisTd.name === levelName) {
        if (toTop) {
          if (tIdx >= 1) {
            neighTd = this.data_service.getLevelData()[tIdx - 1];
          } else {
            return false;
          }
        } else {
          if (tIdx < this.data_service.getLevelData().length - 1) {
            neighTd = this.data_service.getLevelData()[tIdx + 1];
          } else {
            return false;
          }
        }
        neighTd.items.forEach(function (itm) {
          if (neighTd.type === 'SEGMENT') {
            sampleTarget = itm.sampleStart;
          } else if (neighTd.type === 'EVENT') {
            sampleTarget = itm.samplePoint;
          }
          absDist = Math.abs(sample - sampleTarget);

          if (absDist < absMinDist) {

            absMinDist = absDist;
            minDist = sampleTarget - sample;
          }
        });
      }
    });
    if (minDist !== undefined) {
      if (type === 'SEGMENT') {
        this.moveBoundary(levelName, segment.id, minDist, 0, undefined, curAttrDef);
      } else if (type === 'EVENT') {
        this.moveEvent(levelName, segment.id, minDist, curAttrDef);
      }
      return minDist;
    } else {
      return false;
    }
  }
  */

  /**
   *  moves a boundary of a given segment
   *
   *  @param level The level in which the segment lies
   *  @param id The id of the segment
   *  @param changeTime The time to add or subtract
   *  @param isFirst if item is first
   *  @param isLast if item is last
   *
   */
  public moveBoundary (level: ILevel, id, changeTime, isFirst, isLast, attrDefName: string) {
    let orig = this.getItemFromLevelById(level, id);
    let labelIdx = this.getLabelIdx(attrDefName, orig.labels);
    let origRight;
    let ln = this.getItemNeighboursFromLevel(level, id, id);
    if (isFirst) { // before first item
      origRight = ln.right;
      if (origRight !== undefined) {
        if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
          this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      } else {
        if ((orig.sampleStart + changeTime) >= 0 && (orig.sampleDur - changeTime) >= 0 && (orig.sampleStart + orig.sampleDur + changeTime) <= this.sound_handler_service.audioBuffer.length) {
          this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      }
    } else if (isLast) { // after last item
      if ((orig.sampleDur + changeTime) >= 0 && (orig.sampleDur + orig.sampleStart + changeTime) <= this.sound_handler_service.audioBuffer.length) {
        this.updateSegment(level, orig.id, undefined, labelIdx, orig.sampleStart, (orig.sampleDur + changeTime));
      }
    } else {
      if (ln.left === undefined) {
        origRight = ln.right;
        if (origRight !== undefined) {
          if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
            this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
          }
        } else {
          if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + orig.sampleDur + changeTime) <= this.sound_handler_service.audioBuffer.length)) {
            this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
          }
        }
      } else {
        let origLeft = ln.left;
        if ((origLeft.sampleDur + changeTime >= 0) && (orig.sampleStart + changeTime >= 0) && (orig.sampleDur - changeTime >= 0)) {
          this.updateSegment(level, ln.left.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
          this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      }
    }
  }

  /**
   *
   */
  moveEvent (level: ILevel, id, changeTime, attrDefName: string) {
    let orig = this.getItemFromLevelById(level, id);
    let labelIdx = this.getLabelIdx(attrDefName, orig.labels);

    // if (this.link_service.isLinked(id)) {
    if(true){
      console.error("TODO: should check: this.link_service.isLinked(id)");
      let neighbour = this.getItemNeighboursFromLevel(level, id, id);
      if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) <= this.sound_handler_service.audioBuffer.length) { // if within audio
        if (neighbour.left !== undefined && neighbour.right !== undefined) { // if between two events
          // console.log('between two events')
          if ((orig.samplePoint + changeTime) > (neighbour.left.samplePoint) && (orig.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
            this.updatePoint(level, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
          }
        } else if (neighbour.left === undefined && neighbour.right === undefined) { // if only event
          // console.log('only element')
          this.updatePoint(level, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
        } else if (neighbour.left === undefined && neighbour.right !== undefined) { // if first event
          // console.log('first event')
          if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
            this.updatePoint(level, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
          }
        } else if (neighbour.left !== undefined && neighbour.right === undefined) { // if last event
          // console.log('last event')
          if ((orig.samplePoint + changeTime) > neighbour.left.samplePoint && (orig.samplePoint + changeTime) <= this.sound_handler_service.audioBuffer.length) {
            this.updatePoint(level, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
          }
        }
      }
    }
    console.error('uncomment else as well!')
    // else {
    //   // console.log('unlinked event')
    //   if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) <= this.sound_handler_service.audioBuffer.length) {
    //     this.updatePoint(level, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
    //   }
    //   //resort Points after moving
    //   level.items.sort(this.view_state_service.sortbystart);
    // }
  }

  /**
   * reorder points on Event level after moving them. This is needed when Points are moved before or after each other
   *
   */
  public orderPoints (a, b) {
    //Compare "a" and "b" in some fashion, and return -1, 0, or 1
    if (a.samplePoint > b.samplePoint){
      return 1;
    }
    if (a.samplePoint < b.samplePoint){
      return -1;
    }
    return 0;
  }

  /**
   *
   */
  public moveSegment (level: ILevel, id, length, changeTime, attrDefName: string) {
    let firstOrder = this.getOrderById(level, id);
    let firstSegment = level.items[firstOrder];
    let lastSegment = level.items[firstOrder + length - 1];
    let orig, i;
    if (firstSegment !== null && lastSegment !== null) {
      let lastNeighbours = this.getItemNeighboursFromLevel(level, firstSegment.id, lastSegment.id);
      let labelIdx = this.getLabelIdx(attrDefName, firstSegment.labels);
      if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
        let right = this.getItemFromLevelById(level, lastNeighbours.right.id);
        if (((firstSegment.sampleStart + changeTime) > 0) && ((lastNeighbours.right.sampleDur - changeTime) >= 0)) {
          this.updateSegment(level, right.id, undefined, labelIdx, (right.sampleStart + changeTime), (right.sampleDur - changeTime));
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      } else if ((lastNeighbours.right === undefined) && (lastNeighbours.left !== undefined)) {
        let left = this.getItemFromLevelById(level, lastNeighbours.left.id);
        if ((lastNeighbours.left.sampleDur + changeTime) >= 0) {
          if ((lastSegment.sampleStart + lastSegment.sampleDur + changeTime) < this.sound_handler_service.audioBuffer.length) {
            this.updateSegment(level, left.id, undefined, labelIdx, left.sampleStart, (left.sampleDur + changeTime));
            for (i = firstOrder; i < (firstOrder + length); i++) {
              orig = level.items[i];
              this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
            }
          }
        }
      } else if ((lastNeighbours.right !== undefined) && (lastNeighbours.left !== undefined)) {
        let origLeft = this.getItemFromLevelById(level, lastNeighbours.left.id);
        let origRight = this.getItemFromLevelById(level, lastNeighbours.right.id);
        if (((origLeft.sampleDur + changeTime) >= 0) && ((origRight.sampleDur - changeTime) >= 0)) {
          this.updateSegment(level, origLeft.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
          this.updateSegment(level, origRight.id, undefined, labelIdx, (origRight.sampleStart + changeTime), (origRight.sampleDur - changeTime));
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      } else if ((lastNeighbours.right === undefined) && (lastNeighbours.left === undefined)) {
        let first = level.items[firstOrder];
        let last = level.items[firstOrder + length - 1];
        if (((first.sampleStart + changeTime) > 0) && (((last.sampleDur + last.sampleStart) + changeTime) < this.sound_handler_service.audioBuffer.length)) {
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            this.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      }
    }

  }

  /**
   *
   */
  public expandSegment (rightSide, segments, level: ILevel, changeTime, attrDefName: string) {
    let startTime = 0;
    let neighbours = this.getItemNeighboursFromLevel(level, segments[0].id, segments[segments.length - 1].id);
    let labelIdx = this.getLabelIdx(attrDefName, segments[0].labels);
    let tempItem;
    let allow = true;

    if (rightSide) { // if expand or shrink on RIGHT side
      if (neighbours.right === undefined) { // last element
        let lastLength = segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur + (changeTime * segments.length);
        if (lastLength <= this.sound_handler_service.audioBuffer.length) {
          segments.forEach((seg) => {
            tempItem = this.getItemFromLevelById(level, seg.id);
            this.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
            startTime += changeTime;
          });
        }
      } else {
        segments.forEach((seg) => {
          if ((seg.sampleDur + 1 + changeTime) < 0) {
            allow = false;
          }
        });
        if (allow && (neighbours.right.sampleDur - (changeTime * segments.length) > 0)) {
          segments.forEach((seg) => {
            tempItem = this.getItemFromLevelById(level, seg.id);
            this.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
            startTime += changeTime;
          });
          this.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart + startTime, neighbours.right.sampleDur - startTime);
        }
      }
    } else { // if expand or shrink on LEFT side
      if (neighbours.left === undefined) { // first element
        let first = level.items[0];
        if (first.sampleStart + (changeTime * (segments.length + 1)) > 0) {
          segments.forEach((seg) => {
            tempItem = this.getItemFromLevelById(level, seg.id);
            this.updateSegment(level, tempItem.id, undefined, tempItem.sampleStart - changeTime, labelIdx, tempItem.sampleDur + changeTime);
          });
        }
      } else {
        segments.forEach((seg) => {
          if ((seg.sampleDur + 1 + changeTime) < 0) {
            allow = false;
          }
        });
        if (allow && (neighbours.left.sampleDur - (changeTime * segments.length) > 0)) {
          startTime = 0;
          segments.forEach((seg, i) => {
            tempItem = this.getItemFromLevelById(level, seg.id);
            startTime = -(segments.length - i) * changeTime;
            this.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
          });
          this.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, neighbours.left.sampleDur - (segments.length * changeTime));
        }
      }
    }
  }

  /**
   *
   */
  public calcDistanceToNearestZeroCrossing (sample) {
    console.error("calcDistanceToNearestZeroCrossing doesn't belong in LevelService - commented out for the time being.");
    /*
    // walk right
    let distRight = Infinity;
    let distLeft = Infinity;
    let channelData =  this.sound_handler_service.audioBuffer.getChannelData(this.view_state_service.osciSettings.curChannel);
    let i;
    for (i = sample; i < this.sound_handler_service.audioBuffer.length - 1; i++) {
      if (channelData[i] >= 0 && channelData[i + 1] < 0 || channelData[i] < 0 && channelData[i + 1] >= 0) {
        distRight = i - sample;
        break;
      }
    }

    // walk left
    for (i = sample; i > 1; i--) {
      if (channelData[i] >= 0 && channelData[i - 1] < 0 || channelData[i] < 0 && channelData[i - 1] >= 0) {
        distLeft = i - sample;
        break;
      }
    }
    let res;
    if (Math.abs(distLeft) < Math.abs(distRight)) {
      res = distLeft;
    } else {
      res = distRight + 1;
    }

    return res;
    */
  }

  /**
   * Add an item to the end of the specified level
   *
   * @param level onto which to push the new item
   * @param id (optional) if given, this id is used instead of a new one
   *
   * @returns id of the new item or -1 if no item has been added
   */
  pushNewItem (level: ILevel, id) {
    console.debug(level, level, id);

    // Check whether the level has time information
    // and only proceed if this is not the case
    if (level.type === 'ITEM') {
      // Create new item object
      let newObject;
      if (typeof id === 'number') {
        newObject = {id: id, labels: []};
      } else {
        newObject = {id: this.data_service.getNewId(), labels: []};
      }

      // Add all necessary labels
      let attrdefs = this.config_provider_service.getLevelDefinition(level.name).attributeDefinitions;
      for (let i = 0; i < attrdefs.length; ++i) {
        if (attrdefs[i].type === 'STRING') {
          newObject.labels.push({name: attrdefs[i].name, value: ''});
        } else {
          newObject.labels.push({name: attrdefs[i].name, value: null});
        }
      }

      // Insert item into level
      level.items.push (newObject);

      return newObject.id;
    } else {
      return -1;
    }
  };

  /**
   * Add an item next to the item with id === eid.
   * Do nothing if eid is not of type ITEM (ie, if it is on a level with time information)
   *
   * @param eid The ID of the element that will get a new sibling
   * @param before boolean to define whether the new sibling will be inserted before or after eid
   * @param newID optional, only used for redoing from within the history service. if given, no new id is requested from the this.data_service.
   *
   * @return the id of the newly added item (if an item has been added); -1 if no item has been added
   */
  public addItem (eid, before, newID) {
    // Check parameters
    if (eid === undefined) {
      return -1;
    }
    if (typeof before !== 'boolean') {
      return -1;
    }

    // Find the level and item objects corresponding to the given id
    let levelAndItem = this.getLevelAndItem(eid);
    if (levelAndItem === null) {
      console.debug('Could not find item with id:', eid);
      return -1;
    }
    let level = levelAndItem.level;
    let item = levelAndItem.item;


    // Check whether the level has time information
    // and only proceed if this is not the case
    if (level.type === 'ITEM') {
      // Find position of the given element and
      // define position of the new one
      let posOld = level.items.indexOf(item);
      let posNew;
      if (before === true) {
        posNew = posOld;
      } else {
        posNew = posOld + 1;
      }

      // Create new item object
      let newObject;
      if (newID === undefined) {
        newObject = {id: this.data_service.getNewId(), labels: []};
      } else {
        newObject = {id: newID, labels: []};
      }

      // Add all necessary labels
      let attrdefs = this.config_provider_service.getLevelDefinition(level.name).attributeDefinitions;
      for (let i = 0; i < attrdefs.length; ++i) {
        if (attrdefs[i].type === 'STRING') {
          newObject.labels.push({name: attrdefs[i].name, value: ''});
        } else {
          newObject.labels.push({name: attrdefs[i].name, value: null});
        }
      }

      // Insert item into level
      level.items.splice(posNew, 0, newObject);

      return newObject.id;
    }

    return -1;
  };

  /**
   * This is only used as an undo function for the above addItem() and pushNewItem()
   *
   * Deletes an item but doesn't check whether there are links to or from it
   */
  public addItemInvers (id) {
    let levels = this.data_service.getLevelData();

    for (let i = 0; i < levels.length; ++i) {
      for (let ii = 0; ii < levels[i].items.length; ++ii) {
        if (levels[i].items[ii].id === id) {
          levels[i].items.splice(ii, 1);
          return;
        }
      }
    }
  }


  /**
   * Delete an item (of type ITEM, not of type SEGMENT or EVENT)
   * and all links that lead from or to it
   *
   * @param id The ID of the item to be deleted
   * @return an object like {item: object/undefined, ...} (an undefined value of item means that nothing has been done)
   */
  deleteItemWithLinks (id) {
    let result = {
      item: undefined,
      levelName: undefined,
      position: undefined,
      deletedLinks: []
    };

    let levelAndItem = this.getLevelAndItem(id);

    if (levelAndItem === null) {
      // item with the specified id does not exist
      return result;
    }

    let level = levelAndItem.level;
    let item = levelAndItem.item;

    if (level.type !== 'ITEM') {
      // Never touch non-ITEMs
      return result;
    }

    // Delete the item itself
    // console.log('Deleting item:', item, 'From level:', level);
    result.item = item;
    result.levelName = level.name;
    result.position = level.items.indexOf(item);
    level.items.splice(level.items.indexOf(item), 1);

    // Delete all links that lead from or to the item
    // Iterate over the links array backwards so we can manipulate the array from within the loop
    let links = this.data_service.getLinkData();
    for (let i = links.length - 1; i >= 0; --i) {
      if (links[i].fromID === id || links[i].toID === id) {
        // console.log('Deleting link', i);
        result.deletedLinks.push(links[i]);
        links.splice(i, 1);
      }
    }

    return result;
  }

  /**
   * undo the deletion of an item with its links
   */
  public deleteItemWithLinksInvers (item, levelName, position, deletedLinks) {
    // Re-add item
    this.data_service.getLevelDataByName(levelName).items.splice(position, 0, item);

    // Re-add deleted links
    for (let i = 0; i < deletedLinks.length; ++i) {
      this.data_service.insertLinkData(deletedLinks[i]);
    }
  };
}
