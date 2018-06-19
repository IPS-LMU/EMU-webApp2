import { Injectable } from '@angular/core';
import {IItem, ILevel} from '../_interfaces/annot-json.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  public data: any = {};
  public maxItemID = 0;

  ///////////////////////////////
  // public api

  /**
   * returns all the data
   * @return the data
   */
  public getData() {
    return this.data;
  }

  /**
   * sets all the level data
   * @param data containing all level data
   */
  public setLevelData(data) {
    this.data.levels = data;
  }

  /**
   * returns all the level data
   * @return data containing all level data
   */
  public getLevelData() {
    return this.data.levels;
  }


  /**
   * returns all the level data
   * @return data containing all level data
   */
  public getLevelOrder(order) {
    if (this.data.levels !== undefined) {
      return this.data.levels.sort(function (a, b) {
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    }
  }

  /**
   * returns a specific level at given position
   * @param position of the level in the level array
   */
  public getLevelDataAt(position) {
    return this.data.levels[position];
  }

  /**
   * returns a specific level with a given name
   * @param name of the level in the level array
   */
  public getLevelDataByName(name: string): ILevel {
    let found_level;
    this.data.levels.forEach((level) => {
      if(level.name === name){
        found_level = level;
      }
    });
    return found_level;
  }

  /**
   * inserts a single level into level data at a given position
   * @param position of the level in the level array
   * @param newLevel the new level to insert
   */
  public insertLevelDataAt(position, newLevel) {
    this.data.levels.splice(position, 0, newLevel);
  }

  /**
   * deletes a single level from level data at a given position
   * @param position of the level in the level array
   */
  public deleteLevelDataAt(position) {
    this.data.levels.splice(position, 1);
  }

  /**
   * returns all the link data
   * @return the data
   */
  public getLinkData = function () {
    return this.data.links;
  }

  /**
   * sets all the link data
   * @param data containing all link data
   */
  public setLinkData(data) {
    this.data.links = data;
  }

  /**
   * inserts a single link into link data by pushing it
   * on to the array
   * @param newLink the new link to insert
   */
  public insertLinkData(newLink) {
    this.data.links.push(newLink);
  }

  /**
   * deletes a single link from link data at a given position
   * @param position of the link in the link array
   */
  public deleteLinkDataAt(position) {
    this.data.links.splice(position, 1);
  }

  /**
   * inserts a single link into link data at a given position
   * @param position of the link in the link array
   * @param newLink the new link to insert
   */
  public insertLinkDataAt(position, newLink) {
    this.data.links.splice(position, 0, newLink);
  }

  /**
   * changes a single link at a given position with new data
   * @param position of the link in the link array
   * @param fromNewID the new fromID of the link
   * @param toNewID the new toID of the link
   */
  public changeLinkDataAt = function (position, fromNewID, toNewID) {
    this.data.links[position].fromID = fromNewID;
    this.data.links[position].toID = toNewID;
  }

  /**
   * sets annotation data and sets maxItemID
   * by parsing id in elements
   * should be used to fill links and levels
   * @param the data
   */
  public setData(data) {
    // angular.copy(data, sServObj.data); // why is a deep copy necessary here?
    this.data = data;
    this.data.levels.forEach((level) => {
      level.items.forEach((item) => {
        if (item.id > this.maxItemID) {
          this.maxItemID = item.id;
        }
      });
    });
  }

  /**
   * Returns a level object and an item object according to a given item id
   * @param nodeID id of the node
   * @return object with level and item
   */
  public getNodeInfo(nodeID) {
      for (let level: ILevel of this.data.levels) {
        for (let item: IItem of level.items) {
          if (item.id === nodeID) {
            return {
              level: level,
              item: item
            };
          }
        }
      }

      return null;
  }

  /**
   * called externally by functions
   */
  public getNewId() {
    this.maxItemID += 1;
    return this.maxItemID;
  }

  /**
   * called internally by functions
   */
  public raiseId(amount) {
    this.maxItemID += amount;
  }

  /**
   * called internally by functions
   */
  public lowerId(amount) {
    this.maxItemID -= amount;
  }

}
