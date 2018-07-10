import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { ConfigProviderService } from './config-provider.service';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  constructor(private data_service: DataService,
              private config_provider_service: ConfigProviderService) { }

  /**
   * adds single links by pairing all childIds
   * with the parent id (form=={'fromID':fromID, 'toID':toID})
   * @param fromID father node
   * @param toID child node
   */
  public insertLink(fromID, toID) {
    this.data_service.insertLinkData({
      'fromID': fromID,
      'toID': toID
    });
  }

  /**
   * adds single links to this.data_service
   * by pairing all childIds with the parent
   * at a given position
   * @param fromID father node
   * @param toID child node
   * @param order position of the node pair
   */
  public insertLinkAt(fromID, toID, order) {
    this.data_service.insertLinkDataAt(order, {
      'fromID': fromID,
      'toID': toID
    });
  }

  /**
   * removes single link from this.data_service
   * that match the form {'fromID':fromID, 'toID':toID}
   */
  public deleteLink(fromID, toID) {
    let ret = -1;
    this.data_service.getLinkData().forEach((link, linkIdx) => {
      if (link.fromID === fromID && link.toID === toID) {
        this.data_service.deleteLinkDataAt(linkIdx);
        ret = linkIdx;
      }
    });
    return ret;
  }

  /**
   * checks if a given link exists
   * that matches the form {'fromID':fromID, 'toID':toID}
   */
  public linkExists(fromID, toID) {
    let ret = false;
    this.data_service.getLinkData().forEach((link) => {
      if (link.fromID === fromID && link.toID === toID) {
        ret = true;
      }
    });
    return ret;
  }

  /**
   * checks if a given node has parents
   * @param ID node to check
   */
  public hasParents(ID) {
    let ret = false;
    this.data_service.getLinkData().forEach((link) => {
      if (link.toID === ID) {
        ret = true;
      }
    });
    return ret;
  }

  /**
   * checks if a given node has children
   * @param ID node to check
   */
  public hasChildren(ID) {
    let ret = false;
    this.data_service.getLinkData().forEach((link) => {
      if (link.fromID === ID) {
        ret = true;
      }
    });
    return ret;
  }

  /**
   * checks if a given node has parents or children
   * @param ID node to check
   */
  public isLinked(ID) {
    return (this.hasChildren(ID) || this.hasParents(ID));
  }

  /**
   * adds multiple links to this.data_service
   * by pairing all childIds with the parent
   * id (form=={'fromID':fromID, 'toID':childId})
   */
  public insertLinksTo(fromID, toIDs) {
    toIDs.forEach((toID) => {
      this.insertLink(fromID, toID);
    });
  }

  /**
   * removes multiple links to children from this.data_service
   * that match the form {'fromID':fromID, 'toID':toID}
   */
  public deleteLinksTo(fromID, toIDs) {
    let ret = [];
    toIDs.forEach((toID) => {
      this.deleteLink(fromID, toID);
      ret.push({fromID: fromID, toID: toID});
    });
    return ret;
  }

  /**
   * adds multiple links to this.data_service
   * by pairing all parentIds with the child
   * id (form=={'fromID':fromID, 'toID':childId})
   */
  public insertLinksFrom(fromIDs, toID) {
    fromIDs.forEach((fromID) => {
      this.insertLink(fromID, toID);
    });
  }

  /**
   * removes multiple links to parents from this.data_service
   * that match the form {'fromID':fromID, 'toID':toID}
   */
  public deleteLinksFrom(fromIDs, toID) {
    let ret = [];
    fromIDs.forEach((fromID) => {
      ret.push({fromID: fromID, toID: toID});
      this.deleteLink(fromID, toID);
    });
    return ret;
  }

  /**
   * returns all links
   * that match the form {'toID':toID}
   */
  public getLinksTo(toID) {
    let ret = [];
    this.data_service.getLinkData().forEach((link, linkOrder) => {
      if (link.toID === toID) {
        ret.push({link: link, order: linkOrder});
      }
    });
    return ret;
  }

  /**
   * returns all links
   * that match the form {'toID':toID}
   */
  public getLinksFrom(fromID) {
    let ret = [];
    this.data_service.getLinkData().forEach((link, linkOrder) => {
      if (link.fromID === fromID) {
        ret.push({link: link, order: linkOrder});
      }
    });
    return ret;
  }

  /**
   * change a Link (form=={'fromID':fromID, 'toID':toID})
   * to (to=={'fromID':fromID, 'toID':toNewID})
   */
  public changeLinkTo = function (fromID, toID, toNewID) {
    this.data_service.getLinkData().forEach((link, linkOrder) => {
      if (link.fromID === fromID && link.toID === toID) {
        this.data_service.changeLinkDataAt(linkOrder, fromID, toNewID);
      }
    });
  }

  /**
   * change a Link (form=={'fromID':fromID, 'toID':toID})
   * to (to=={'fromID':fromID, 'toID':toNewID})
   */
  public changeLinkFrom(fromID, toID, fromNewID) {
    this.data_service.getLinkData().forEach((link, linkOrder) => {
      if (link.fromID === fromID && link.toID === toID) {
        this.data_service.changeLinkDataAt(linkOrder, fromNewID, toID);
      }
    });
  }

  /**
   * removes multiple links from and to ID
   */
  public deleteLinkSegment(segments) {
    let linksTo = [];
    let linksFrom = [];
    segments.forEach((segment) => {
      this.getLinksTo(segment.id).forEach((found) => {
        linksTo.push({fromID: found.link.fromID, toID: found.link.toID});
        this.deleteLink(found.link.fromID, found.link.toID);
      });
      this.getLinksFrom(segment.id).forEach((found) => {
        linksFrom.push({fromID: found.link.fromID, toID: found.link.toID});
        this.deleteLink(found.link.fromID, found.link.toID);
      });
    });
    return {linksTo: linksTo, linksFrom: linksFrom};
  }


  /**
   * removes multiple links from and to ID
   */
  public deleteLinkSegmentInvers(deleted) {
    deleted.linksTo.forEach((found) => {
      this.insertLink(found.fromID, found.toID);
    });
    deleted.linksFrom.forEach((found) => {
      this.insertLink(found.fromID, found.toID);
    });
  }

  /**
   * reorganizes multiple links from and to ID
   * if a boundary between two items is deleted
   */
  public deleteLinkBoundary(ID, neighbourID, LevelService) {
    let linksTo = [];
    let linksFrom = [];
    let ord = 0;
    let levelName = LevelService.getLevelName(neighbourID);

    let onlyInM2m = true; // only in MANY_TO_MANY relationships
    this.config_provider_service.curDbConfig.linkDefinitions.forEach((linkDef) => {
      if(linkDef.superlevelName === levelName || linkDef.sublevelName === levelName){
        if(linkDef.type !== 'MANY_TO_MANY'){
          onlyInM2m = false;
        }
      }
    });


    if (neighbourID >= 0) { // if not first item (neighbourID is -1 if it is the first item)
      this.getLinksTo(ID).forEach((found) => {
        if (this.linkExists(found.link.fromID, neighbourID)) {
          ord = this.deleteLink(found.link.fromID, ID);
          linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
        }
        else {
          if(onlyInM2m){ // only relink in MANY_TO_MANY relationships
            this.changeLinkTo(found.link.fromID, ID, neighbourID);
            linksTo.push({
              fromID: found.link.fromID,
              toID: ID,
              deleted: false,
              order: ord,
              neighbourID: neighbourID
            });
          }
        }
      });
      this.getLinksFrom(ID).forEach((found) => {
        if (this.linkExists(neighbourID, found.link.toID)) {
          ord = this.deleteLink(ID, found.link.toID);
          linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
        }
        else {
          this.changeLinkFrom(ID, found.link.toID, neighbourID);
          linksFrom.push({
            fromID: ID,
            toID: found.link.toID,
            deleted: false,
            order: ord,
            neighbourID: neighbourID
          });
        }

      });
    }
    else {
      this.getLinksTo(ID).forEach((found) => {
        ord = this.deleteLink(found.link.fromID, ID);
        linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
      });
      this.getLinksFrom(ID).forEach((found) => {
        ord = this.deleteLink(ID, found.link.toID);
        linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
      });
    }
    return {linksTo: linksTo, linksFrom: linksFrom};
  };

  /**
   * removes multiple links from and to ID
   */
  public deleteLinkBoundaryInvers(deleted) {
    deleted.linksTo.forEach((found) => {
      if (found.deleted) {
        this.insertLinkAt(found.fromID, found.toID, found.order);
      }
      else {
        this.changeLinkTo(found.fromID, found.neighbourID, found.toID);
      }
    });
    deleted.linksFrom.forEach((found) => {
      if (found.deleted) {
        this.insertLinkAt(found.fromID, found.toID, found.order);
      }
      else {
        this.changeLinkFrom(found.neighbourID, found.toID, found.fromID);
      }
    });
  }

}
