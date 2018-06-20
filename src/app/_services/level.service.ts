import {IItem, ILabel, ILevel} from '../_interfaces/annot-json.interface';

export class LevelService {
  /**
   * search for the according label field in labels
   * and return its position
   *    @param attributeName
   *    @param labels
   */
  public static getLabelIdx(attributeName: string, labels: ILabel[]): number {
    for (let i = 0; i < labels.length; ++i) {
      if (labels[i].name === attributeName) {
        return i;
      }
    }

    return null;
  }

  /**
   * gets element position inside a given level
   * by passing in the element id
   *    @param level
   *    @param id
   */
  public static getOrderById(level: ILevel, id: number): number {
    for (let i = 0; i < level.items.length; ++i) {
      if (level.items[i].id === id) {
        return i;
      }
    }

    return null;
  }

  /**
   * get next or prev Element in time inside a given level
   * after or before (boolean) an element with 'id'
   *    @param level
   *    @param id
   *    @param after
   */
  public static getItemInTime(level: ILevel, id: number, after: boolean): IItem {
    let result = null;
    let timeDifference = Infinity;
    let startItem = LevelService.getItemFromLevelById(level, id);

    if (startItem === null) {
        return null;
    }

    let myStart = startItem.sampleStart || startItem.samplePoint;

    for (const item of level.items) {
      let start = item.sampleStart || item.samplePoint;
      if (after) {
        if (start > myStart && start - myStart <= timeDifference) {
          timeDifference = start - myStart;
          result = item;
        }
      } else {
        if (start < myStart && myStart - start <= timeDifference) {
          timeDifference = myStart - start;
          result = item;
        }
      }
    }

    return result;
  }

  /**
   * returns item from a given level by passing in the item 'id'
   *    @param level
   *    @param id
   */
  public static getItemFromLevelById(level: ILevel, id: number): IItem {
    for (const item of level.items) {
      if (item.id === id) {
        return item;
      }
    }

    return null;
  }


  /**
   * get all labels of an attribute on a particular level
   * return them as a flat array
   * @param level containing labels
   * @param attributeName Name of the attribute
   * @return array containing all labels (form==['x','y','z'])
   */
  public static getAllLabelsOfLevel(level: ILevel, attributeName: string): string[] {
    const labels = [];

    for (const item of level.items) {
        for (const label of item.labels) {
            if (label.name === attributeName) {
                labels.push(label.value);
            }
        }
    }

    return labels;
  }

  /**
   * insert a new Item with id labelname start and duration at position on level
   */
  public static insertItemDetails (id, level: ILevel, position, labelname, start, duration, curAttrDef: string, attrDefs) {
    let newElement;
    if (attrDefs === undefined) { // ugly hack if attrDefs undefined
      attrDefs = [];
    }
    if (level.type === 'SEGMENT') {
      newElement = {
        id: id,
        sampleStart: start,
        sampleDur: duration,
        labels: []
      };
      if (attrDefs.length > 0) {
        for (let i = 0; i < attrDefs.length; i++) {
          if (attrDefs[i].name === curAttrDef) {
            newElement.labels.push({
              name: attrDefs[i].name,
              value: labelname
            });
          } else {
            newElement.labels.push({
              name: attrDefs[i].name,
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
      if (attrDefs.length > 0) {
        for (let i = 0; i < attrDefs.length; i++) {
          if (attrDefs[i].name === curAttrDef) {
            newElement.labels.push({
              name: attrDefs[i].name,
              value: labelname
            });
          } else {
            newElement.labels.push({
              name: attrDefs[i].name,
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
  public static updateSegment (level: ILevel, id, labelname, labelIdx, start, duration) {
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
   * gets item details by passing in level and item id's
   */
  public static getItemNeighboursFromLevel (level: ILevel, firstId, lastId) {
    let left: IItem;
    let right: IItem;

    for (let i = 0; i < level.items.length; ++i) {
        if (level.items[i].id === firstId) {
            left = level.items[i - 1];
        }
        if (level.items[i].id === lastId) {
            right = level.items[i + 1];
        }
    }

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
  public static getClosestItem (sampleNr, level: ILevel, maximum) {
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
   * rename the label of an element by passing in level and id
   */
  public static renameLabel (level: ILevel, id, attrIndex, newLabelName) {
    LevelService.updateSegment(level, id, newLabelName, attrIndex, undefined, undefined);
  };

  /**
   *
   */
  public static deleteSegmentsInvers (level: ILevel, id, length, deletedSegment, attrDefName: string) {
    let labelIdx;
    let x, insertPoint;
    insertPoint = 0;
    insertPoint = deletedSegment.order;
    for (x in deletedSegment.segments) {
      level.items.splice(insertPoint++, 0, deletedSegment.segments[x]);
    }
    let lastNeighbours = LevelService.getItemNeighboursFromLevel(level, deletedSegment.segments[0].id, deletedSegment.segments[deletedSegment.segments.length - 1].id);

    if ((lastNeighbours.left !== undefined) && (lastNeighbours.right === undefined)) {
      labelIdx = LevelService.getLabelIdx(attrDefName, lastNeighbours.left.labels);
      LevelService.updateSegment(level, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeRight));
    } else if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
      labelIdx = LevelService.getLabelIdx(attrDefName, lastNeighbours.right.labels);
      LevelService.updateSegment(level, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeLeft), (lastNeighbours.right.sampleDur - deletedSegment.timeLeft));
    } else if ((lastNeighbours.left === undefined) && (lastNeighbours.right === undefined)) {

    } else {
      labelIdx = LevelService.getLabelIdx(attrDefName, lastNeighbours.left.labels);
      LevelService.updateSegment(level, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeLeft));
      LevelService.updateSegment(level, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeRight), (lastNeighbours.right.sampleDur - deletedSegment.timeRight));
    }
  };

  /**
   *
   */
  public static deleteSegments (level: ILevel, id, length, attrDefName: string) {
    let firstSegment = LevelService.getItemFromLevelById(level, id);
    let firstOrder = LevelService.getOrderById(level, id);
    let lastSegment = level.items[firstOrder + length - 1];
    let neighbours = LevelService.getItemNeighboursFromLevel(level, firstSegment.id, lastSegment.id);
    let timeLeft = 0;
    let timeRight = 0;
    let deleteOrder = null;
    let deletedSegment = null;
    let clickSeg = null;
    let labelIdx = LevelService.getLabelIdx(attrDefName, firstSegment.labels);

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
      LevelService.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeRight));
      clickSeg = neighbours.left;
    } else if ((neighbours.left === undefined) && (neighbours.right !== undefined)) {
      LevelService.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeLeft, (neighbours.right.sampleDur + timeLeft));
      clickSeg = neighbours.right;
    } else if ((neighbours.left === undefined) && (neighbours.right === undefined)) {
      // nothing left to do level empty now
      /*
      @todo the viewState must be handled elsewhere - probably as an @Output in LevelComponent
      this.view_state_service.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
      */
    } else {
      LevelService.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeLeft));
      LevelService.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeRight, (neighbours.right.sampleDur + timeRight));
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
  public static insertSegmentInvers (level: ILevel, start, end) {
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
  public static insertSegment (level: ILevel, start, end, newLabel, ids, curAttrDef: string, attrDefs) {
    if (ids === undefined) {
      console.error("insertSegment must be called with two ids");
      return {
        ret: false,
        ids: undefined
      };
    }

    let ret = true;
    let diff, diff2, startID, endID;
    if (start === end) {
      if (level.items.length === 0) { // if on an empty level
        return {
          ret: false,
          ids: ids
        };
      } else { // if not on an empty level
        startID = -1;
        if (start < level.items[0].sampleStart) { // before first segment
          diff = level.items[0].sampleStart - start;
          LevelService.insertItemDetails(ids[0], level, 0, newLabel, start, diff - 1, curAttrDef, attrDefs);
        } else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
          let newStart = (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur + 1);
          LevelService.insertItemDetails(ids[0], level, level.items.length, newLabel, newStart, start - newStart, curAttrDef, attrDefs);
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
            LevelService.insertItemDetails(ids[0], level, startID + 1, newLabel, start, level.items[startID].sampleDur - diff - 1, curAttrDef, attrDefs);
            level.items[startID].sampleDur = diff;
          }
        }
      }
    } else {
      if (level.items.length === 0) { // if on an empty level
        LevelService.insertItemDetails(ids[0], level, 0, newLabel, start, (end - start) - 1, curAttrDef, attrDefs);
      } else { // if not on an empty level
        if (end < level.items[0].sampleStart) { // before first segment
          diff = level.items[0].sampleStart - end - 1;
          diff2 = end - start - 1;
          LevelService.insertItemDetails(ids[0], level, 0, newLabel, end, diff, curAttrDef, attrDefs);
          LevelService.insertItemDetails(ids[1], level, 0, newLabel, start, diff2, curAttrDef, attrDefs);

        } else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
          diff = start - (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur) - 1;
          diff2 = end - start - 1;
          let len = level.items.length;
          LevelService.insertItemDetails(ids[0], level, len, newLabel, (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur), diff, curAttrDef, attrDefs);
          LevelService.insertItemDetails(ids[1], level, len + 1, newLabel, start, diff2, curAttrDef, attrDefs);
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
            LevelService.insertItemDetails(ids[0], level, startID + 1, newLabel, start, diff2, curAttrDef, attrDefs);
            LevelService.insertItemDetails(ids[1], level, startID + 2, newLabel, end, level.items[startID].sampleDur - diff - 1 - diff2 - 1, curAttrDef, attrDefs);
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
  public static insertEvent (level: ILevel, start, pointName, id, curAttrDef: string, attrDefs) {
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
        console.error("insertEvent must be called with an id");
        return;
      }
      LevelService.insertItemDetails(id, level, pos, pointName, start, undefined, curAttrDef, attrDefs);
    }
    return {
      alreadyExists: alreadyExists,
      id: id
    };
  };

  /**
   *
   */
  public static deleteEvent (level: ILevel, id): IItem {
    let ret;
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
  public static deleteBoundary (level: ILevel, id, isFirst, isLast) {
    let toDelete = LevelService.getItemFromLevelById(level, id);
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
  public static deleteBoundaryInvers (level: ILevel, id, isFirst, isLast, deletedSegment) {
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
  public static moveBoundary (level: ILevel, id, changeTime, isFirst, isLast, attrDefName: string, audioBufferLength: number) {
    let orig = LevelService.getItemFromLevelById(level, id);
    let labelIdx = LevelService.getLabelIdx(attrDefName, orig.labels);
    let origRight;
    let ln = LevelService.getItemNeighboursFromLevel(level, id, id);
    if (isFirst) { // before first item
      origRight = ln.right;
      if (origRight !== undefined) {
        if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
          LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      } else {
        if ((orig.sampleStart + changeTime) >= 0 && (orig.sampleDur - changeTime) >= 0 && (orig.sampleStart + orig.sampleDur + changeTime) <= audioBufferLength) {
          LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      }
    } else if (isLast) { // after last item
      if ((orig.sampleDur + changeTime) >= 0 && (orig.sampleDur + orig.sampleStart + changeTime) <= audioBufferLength) {
        LevelService.updateSegment(level, orig.id, undefined, labelIdx, orig.sampleStart, (orig.sampleDur + changeTime));
      }
    } else {
      if (ln.left === undefined) {
        origRight = ln.right;
        if (origRight !== undefined) {
          if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
            LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
          }
        } else {
          if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + orig.sampleDur + changeTime) <= audioBufferLength)) {
            LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
          }
        }
      } else {
        let origLeft = ln.left;
        if ((origLeft.sampleDur + changeTime >= 0) && (orig.sampleStart + changeTime >= 0) && (orig.sampleDur - changeTime >= 0)) {
          LevelService.updateSegment(level, ln.left.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
          LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
        }
      }
    }
  }

  /**
   *
   */
  public static moveEvent (level: ILevel, id: number, changeTime: number, audioBufferLength: number) {
    if (level.type !== 'EVENT') {
      console.error('BUG: Non-events cannot be moved with moveEvent()');
      return;
    }

    const event = LevelService.getItemFromLevelById(level, id);
    if (!event) {
      console.error('BUG: event doest not exist on level', id, level);
      return;
    }

    // if (this.link_service.isLinked(id)) {
    if(true){
      console.error("TODO: should check: this.link_service.isLinked(id)");
      let neighbour = LevelService.getItemNeighboursFromLevel(level, id, id);
      if ((event.samplePoint + changeTime) > 0 && (event.samplePoint + changeTime) <= audioBufferLength) { // if within audio
        if (neighbour.left !== undefined && neighbour.right !== undefined) { // if between two events
          // console.log('between two events')
          if ((event.samplePoint + changeTime) > (neighbour.left.samplePoint) && (event.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
            event.samplePoint += changeTime;
          }
        } else if (neighbour.left === undefined && neighbour.right === undefined) { // if only event
          // console.log('only element')
          event.samplePoint += changeTime;
        } else if (neighbour.left === undefined && neighbour.right !== undefined) { // if first event
          // console.log('first event')
          if ((event.samplePoint + changeTime) > 0 && (event.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
            event.samplePoint += changeTime;
          }
        } else if (neighbour.left !== undefined && neighbour.right === undefined) { // if last event
          // console.log('last event')
          if ((event.samplePoint + changeTime) > neighbour.left.samplePoint && (event.samplePoint + changeTime) <= audioBufferLength) {
            event.samplePoint += changeTime;
          }
        }
      }
    }
    console.error('uncomment else as well!')
    // else {
    //   // console.log('unlinked event')
    //   if ((event.samplePoint + changeTime) > 0 && (event.samplePoint + changeTime) <= audioBufferLength) {
    //     event.samplePoint += changeTime;
    //   }
    //   //resort Points after moving
    //   level.items.sort(this.view_state_service.sortbystart);
    // }
  }

  /**
   * reorder points on Event level after moving them. This is needed when Points are moved before or after each other
   *
   */
  public static orderPoints (a, b) {
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
  public static moveSegment (level: ILevel, id, length, changeTime, attrDefName: string, audioBufferLength: number) {
    let firstOrder = LevelService.getOrderById(level, id);
    let firstSegment = level.items[firstOrder];
    let lastSegment = level.items[firstOrder + length - 1];
    let orig, i;
    if (firstSegment !== null && lastSegment !== null) {
      let lastNeighbours = LevelService.getItemNeighboursFromLevel(level, firstSegment.id, lastSegment.id);
      let labelIdx = LevelService.getLabelIdx(attrDefName, firstSegment.labels);
      if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
        let right = LevelService.getItemFromLevelById(level, lastNeighbours.right.id);
        if (((firstSegment.sampleStart + changeTime) > 0) && ((lastNeighbours.right.sampleDur - changeTime) >= 0)) {
          LevelService.updateSegment(level, right.id, undefined, labelIdx, (right.sampleStart + changeTime), (right.sampleDur - changeTime));
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      } else if ((lastNeighbours.right === undefined) && (lastNeighbours.left !== undefined)) {
        let left = LevelService.getItemFromLevelById(level, lastNeighbours.left.id);
        if ((lastNeighbours.left.sampleDur + changeTime) >= 0) {
          if ((lastSegment.sampleStart + lastSegment.sampleDur + changeTime) < audioBufferLength) {
            LevelService.updateSegment(level, left.id, undefined, labelIdx, left.sampleStart, (left.sampleDur + changeTime));
            for (i = firstOrder; i < (firstOrder + length); i++) {
              orig = level.items[i];
              LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
            }
          }
        }
      } else if ((lastNeighbours.right !== undefined) && (lastNeighbours.left !== undefined)) {
        let origLeft = LevelService.getItemFromLevelById(level, lastNeighbours.left.id);
        let origRight = LevelService.getItemFromLevelById(level, lastNeighbours.right.id);
        if (((origLeft.sampleDur + changeTime) >= 0) && ((origRight.sampleDur - changeTime) >= 0)) {
          LevelService.updateSegment(level, origLeft.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
          LevelService.updateSegment(level, origRight.id, undefined, labelIdx, (origRight.sampleStart + changeTime), (origRight.sampleDur - changeTime));
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      } else if ((lastNeighbours.right === undefined) && (lastNeighbours.left === undefined)) {
        let first = level.items[firstOrder];
        let last = level.items[firstOrder + length - 1];
        if (((first.sampleStart + changeTime) > 0) && (((last.sampleDur + last.sampleStart) + changeTime) < audioBufferLength)) {
          for (i = firstOrder; i < (firstOrder + length); i++) {
            orig = level.items[i];
            LevelService.updateSegment(level, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
          }
        }
      }
    }

  }

  /**
   *
   */
  public static expandSegment (rightSide, segments, level: ILevel, changeTime, attrDefName: string, audioBufferLength: number) {
    let startTime = 0;
    let neighbours = LevelService.getItemNeighboursFromLevel(level, segments[0].id, segments[segments.length - 1].id);
    let labelIdx = LevelService.getLabelIdx(attrDefName, segments[0].labels);
    let tempItem;
    let allow = true;

    if (rightSide) { // if expand or shrink on RIGHT side
      if (neighbours.right === undefined) { // last element
        let lastLength = segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur + (changeTime * segments.length);
        if (lastLength <= audioBufferLength) {
          segments.forEach((seg) => {
            tempItem = LevelService.getItemFromLevelById(level, seg.id);
            LevelService.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
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
            tempItem = LevelService.getItemFromLevelById(level, seg.id);
            LevelService.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
            startTime += changeTime;
          });
          LevelService.updateSegment(level, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart + startTime, neighbours.right.sampleDur - startTime);
        }
      }
    } else { // if expand or shrink on LEFT side
      if (neighbours.left === undefined) { // first element
        let first = level.items[0];
        if (first.sampleStart + (changeTime * (segments.length + 1)) > 0) {
          segments.forEach((seg) => {
            tempItem = LevelService.getItemFromLevelById(level, seg.id);
            LevelService.updateSegment(level, tempItem.id, undefined, tempItem.sampleStart - changeTime, labelIdx, tempItem.sampleDur + changeTime);
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
            tempItem = LevelService.getItemFromLevelById(level, seg.id);
            startTime = -(segments.length - i) * changeTime;
            LevelService.updateSegment(level, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
          });
          LevelService.updateSegment(level, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, neighbours.left.sampleDur - (segments.length * changeTime));
        }
      }
    }
  }

  /**
   *
   */
  public static calcDistanceToNearestZeroCrossing (sample) {
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
  public static pushNewItem (level: ILevel, attrDefs, id) {
    console.debug(level, level, id);

    // Check whether the level has time information
    // and only proceed if this is not the case
    if (level.type === 'ITEM') {
      // Create new item object
      let newObject;
      if (typeof id === 'number') {
        newObject = {id: id, labels: []};
      } else {
          console.error("pushNewItem() must be called with an id");
          return -1;
      }

      // Add all necessary labels
      for (let i = 0; i < attrDefs.length; ++i) {
        if (attrDefs[i].type === 'STRING') {
          newObject.labels.push({name: attrDefs[i].name, value: ''});
        } else {
          newObject.labels.push({name: attrDefs[i].name, value: null});
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
   * Add an item next to a given sibling item.
   * Do nothing if the given sibling is not of type ITEM (ie, if it is on a level with time information)
   *
   * @param sibling The element that will get a new sibling
   * @param level The given sibling's level
   * @param attrDefs The level's attribute definitions.
   * @param before boolean to define whether the new sibling will be inserted before or after the sibling
   * @param newID optional, only used for redoing from within the history service. if given, no new id is requested from the this.data_service.
   *
   * @return the id of the newly added item (if an item has been added); -1 if no item has been added
   */
  public static addItem (sibling: IItem, level: ILevel, attrDefs, before, newID) {
    // Check whether the level has time information
    // and only proceed if this is not the case
    if (level.type === 'ITEM') {
      // Find position of the given element and
      // define position of the new one
      let posOld = level.items.indexOf(sibling);
      let posNew;
      if (before === true) {
        posNew = posOld;
      } else {
        posNew = posOld + 1;
      }

      // Create new item object
      let newObject;
      if (newID === undefined) {
        console.error("addItem() must be called with an id");
        return -1;
      } else {
        newObject = {id: newID, labels: []};
      }

      // Add all necessary labels
      for (let i = 0; i < attrDefs.length; ++i) {
        if (attrDefs[i].type === 'STRING') {
          newObject.labels.push({name: attrDefs[i].name, value: ''});
        } else {
          newObject.labels.push({name: attrDefs[i].name, value: null});
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
  public static addItemInvers (id, levels) {
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
   * @param nodeInfo The item to remove and its level
   * @param linkData All links in the current annotation
   * @return an object like {item: object/undefined, ...} (an undefined value of item means that nothing has been done)
   */
  public static deleteItemWithLinks (nodeInfo, linkData) {
    let result = {
      item: undefined,
      levelName: undefined,
      position: undefined,
      deletedLinks: []
    };

    if (nodeInfo === null) {
      // specified item does not exist
      return result;
    }

    let level = nodeInfo.level;
    let item = nodeInfo.item;

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
    for (let i = linkData.length - 1; i >= 0; --i) {
      if (linkData[i].fromID === nodeInfo || linkData[i].toID === nodeInfo) {
        // console.log('Deleting link', i);
        result.deletedLinks.push(linkData[i]);
        linkData.splice(i, 1);
      }
    }

    return result;
  }

  /**
   * undo the deletion of an item with its links
   */
  public static deleteItemWithLinksInvers (nodeInfo, position, deletedLinks, linkData) {
    // Re-add item
    nodeInfo.level.items.splice(position, 0, nodeInfo.item);

    // Re-add deleted links
    for (let i = 0; i < deletedLinks.length; ++i) {
      linkData.push(deletedLinks[i]);
    }
  };
}
