import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { MatDialog } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import { DataService } from "../_services/data.service";
import { ConfigProviderService } from "../_services/config-provider.service";
import { ViewStateService } from "../_services/view-state.service";
import { SoundHandlerService } from "../_services/sound-handler.service";
import { ConnectComponent } from '../_dialogs/connect/connect.component';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm.component';
import { HistoryService } from '../_services/history.service';
import { AppStateService } from '../_services/app-state.service';
import { IohandlerService } from '../_services/iohandler.service';
import { AppComponent } from '../app.component'; // probably a bad idea!


@Component({
  selector: 'app-mainlayout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})

export class MainlayoutComponent implements OnInit, OnDestroy {

  hotkey_q: Hotkey | Hotkey[];
  hotkey_e: Hotkey | Hotkey[];

  hotkey_w: Hotkey | Hotkey[];
  hotkey_a: Hotkey | Hotkey[];
  hotkey_s: Hotkey | Hotkey[];
  hotkey_d: Hotkey | Hotkey[];

  hotkey_f: Hotkey | Hotkey[];
  hotkey_space: Hotkey | Hotkey[];
  hotkey_c: Hotkey | Hotkey[];

  hotkey_up: Hotkey | Hotkey[];
  hotkey_down: Hotkey | Hotkey[];


  constructor(private mat_icon_registry: MatIconRegistry,
              private dom_sanitizer: DomSanitizer,
              public data_service: DataService,
              public config_provider_service: ConfigProviderService,
              public view_state_service: ViewStateService,
              public sound_handler_service: SoundHandlerService,
              public confirmDialog: MatDialog,
              public connectDialog: MatDialog,
              public hotkeys_service: HotkeysService,
              private history_service: HistoryService,
              private app_state_service: AppStateService,
              private io_handler_service: IohandlerService,
              private app_component: AppComponent
  ) {

    this.mat_icon_registry.addSvgIcon(
      'EMUwebAppEmu',
      this.dom_sanitizer.bypassSecurityTrustResourceUrl('assets/EMU-webAppEmu.svg')
    );


    /////////////////////////
    // hotkey registration

    //   // check if mouse has to be in labeler for key mappings
    //   if (this.config_provider_service.vals.main.catchMouseForKeyBinding) {
    //     if (!this.view_state_service.mouseInEmuWebApp) {
    //       return;
    //     }
    //   }
    //   this.view_state_service.setlastKeyCode(code);
    //
    //   var attrIndex, newValue, oldValue, levelName, levelType, neighbor, minDist, mouseSeg;
    //   var lastNeighboursMove, neighbours, seg, insSeg, lastEventMove, deletedSegment, deletedLinks;
    //
    //   // Handle key strokes for the hierarchy modal
    //   if (this.view_state_service.hierarchyState.isShown() && this.view_state_service.hierarchyState !== undefined) {
    //     if (this.view_state_service.hierarchyState.getInputFocus()) {
    //       // Commit label change
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyCommitEdit) {
    //         var elementID = this.view_state_service.hierarchyState.getContextMenuID();
    //         var element = LevelService.getItemByID(elementID);
    //         levelName = LevelService.getLevelName(elementID);
    //         attrIndex = this.view_state_service.getCurAttrIndex(levelName);
    //         var legalLabels = this.config_provider_service.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;
    //         newValue = this.view_state_service.hierarchyState.getEditValue();
    //         if (element.labels[attrIndex] !== undefined) {
    //           oldValue = element.labels[attrIndex].value;
    //         } else {
    //           oldValue = '';
    //         }
    //         if (newValue !== undefined && newValue !== oldValue) {
    //           // Check if new value is legal
    //           if (legalLabels === undefined || (newValue.length > 0 && legalLabels.indexOf(newValue) >= 0)) {
    //             LevelService.renameLabel(levelName, elementID, attrIndex, newValue);
    //             HistoryService.addObjToUndoStack({
    //               // Re-Using the already existing ANNOT/RENAMELABEL
    //               // I could also define HIERARCHY/RENAMELABEL for keeping the logical structure,
    //               // but it would have the same code
    //               'type': 'ANNOT',
    //               'action': 'RENAMELABEL',
    //               'name': levelName,
    //               'id': elementID,
    //               'attrIndex': attrIndex,
    //               'oldValue': oldValue,
    //               'newValue': newValue
    //             });
    //             this.view_state_service.hierarchyState.closeContextMenu();
    //           }
    //         } else {
    //           this.view_state_service.hierarchyState.closeContextMenu();
    //         }
    //       }
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyCancelEdit) {
    //         this.view_state_service.hierarchyState.closeContextMenu();
    //       }
    //     } else {
    //       //if (!e.metaKey && !e.ctrlKey) {
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyDeleteLink) {
    //         e.preventDefault();
    //       }
    //
    //       // Play selected item
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyPlayback) {
    //         e.preventDefault();
    //         this.view_state_service.hierarchyState.playing += 1;
    //         // console.log('hierarchyPlayback');
    //       }
    //
    //       // rotateHierarchy
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyRotate) {
    //         this.view_state_service.hierarchyState.toggleRotation();
    //       }
    //
    //       // Delete link
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyDeleteLink) {
    //         /*
    //                            This block is currently obsoleted because e.preventDefault() is called above
    //                            at the beginning of the hierarchy block
    //                            // This should only be called when certain keys are pressed that are known to trigger some browser behaviour.
    //                            // But what if the key code is reconfigured (possibly by the user)?
    //                            e.preventDefault();
    //                            */
    //
    //         var pos = LinkService.deleteLink(this.view_state_service.hierarchyState.selectedLinkFromID, this.view_state_service.hierarchyState.selectedLinkToID);
    //
    //         if (pos !== -1) {
    //           HistoryService.addObjToUndoStack({
    //             type: 'HIERARCHY',
    //             action: 'DELETELINK',
    //             fromID: this.view_state_service.hierarchyState.selectedLinkFromID,
    //             toID: this.view_state_service.hierarchyState.selectedLinkToID,
    //             position: pos
    //           });
    //         }
    //       }
    //
    //       // Delete item
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyDeleteItem) {
    //         var result = LevelService.deleteItemWithLinks(this.view_state_service.hierarchyState.selectedItemID);
    //
    //         if (result.item !== undefined) {
    //           HistoryService.addObjToUndoStack({
    //             type: 'HIERARCHY',
    //             action: 'DELETEITEM',
    //             item: result.item,
    //             levelName: result.levelName,
    //             position: result.position,
    //             deletedLinks: result.deletedLinks
    //           });
    //         }
    //       }
    //
    //       // Add item ...
    //       // ... before the currently selected one
    //       var newID;
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyAddItemBefore) {
    //         newID = LevelService.addItem(this.view_state_service.hierarchyState.selectedItemID, true);
    //
    //         if (newID !== -1) {
    //           HistoryService.addObjToUndoStack({
    //             type: 'HIERARCHY',
    //             action: 'ADDITEM',
    //             newID: newID,
    //             neighborID: this.view_state_service.hierarchyState.selectedItemID,
    //             before: true
    //           });
    //         }
    //       }
    //       // ... after the currently selected one
    //       if (code === this.config_provider_service.vals.keyMappings.hierarchyAddItemAfter) {
    //         newID = LevelService.addItem(this.view_state_service.hierarchyState.selectedItemID, false);
    //
    //         if (newID !== -1) {
    //           HistoryService.addObjToUndoStack({
    //             type: 'HIERARCHY',
    //             action: 'ADDITEM',
    //             newID: newID,
    //             neighborID: this.view_state_service.hierarchyState.selectedItemID,
    //             before: false
    //           });
    //         }
    //       }
    //
    //       /* Add link
    //                        if (code === this.config_provider_service.vals.keyMappings.hierarchyAddLink) {
    //                        if (this.view_state_service.hierarchyState.newLinkFromID === undefined) {
    //                        this.view_state_service.hierarchyState.newLinkFromID = this.view_state_service.hierarchyState.selectedItemID;
    //                        } else {
    //                        var linkObj = HierarchyManipulationService.addLink(this.view_state_service.hierarchyState.path, this.view_state_service.hierarchyState.newLinkFromID, this.view_state_service.hierarchyState.selectedItemID);
    //                        this.view_state_service.hierarchyState.newLinkFromID = undefined;
    //                        if (linkObj !== null) {
    //                        HistoryService.addObjToUndoStack({
    //                        type: 'HIERARCHY',
    //                        action: 'ADDLINK',
    //                        link: linkObj
    //                        });
    //                        }
    //                        }
    //                        }*/
    //
    //       // levelUp
    //       if (code === this.config_provider_service.vals.keyMappings.levelUp){
    //         // console.log("prevPath");
    //         if(this.view_state_service.hierarchyState.curPathIdx >= 1) {
    //           this.view_state_service.hierarchyState.curPathIdx = this.view_state_service.hierarchyState.curPathIdx - 1;
    //         }
    //       }
    //
    //       // levelDown
    //       if (code === this.config_provider_service.vals.keyMappings.levelDown){
    //         // console.log("nextPath");
    //         if(this.view_state_service.hierarchyState.curPathIdx < this.view_state_service.hierarchyState.curNrOfPaths - 1){
    //           this.view_state_service.hierarchyState.curPathIdx = this.view_state_service.hierarchyState.curPathIdx + 1;
    //         }
    //       }
    //
    //
    //       // undo
    //       if (code === this.config_provider_service.vals.keyMappings.undo) {
    //         HistoryService.undo();
    //       }
    //
    //       // redo
    //       if (code === this.config_provider_service.vals.keyMappings.redo) {
    //         HistoryService.redo();
    //       }
    //
    //       // close modal
    //       if (!e.shiftKey && (code === this.config_provider_service.vals.keyMappings.esc || code === this.config_provider_service.vals.keyMappings.showHierarchy)) {
    //         modalService.close();
    //       }
    //     }
    //   } else if (this.view_state_service.isEditing()) {
    //     var domElement = $('.' + LevelService.getlasteditArea());
    //     // preventing new line if saving not allowed
    //     if (!this.view_state_service.isSavingAllowed() && code === this.config_provider_service.vals.keyMappings.createNewItemAtSelection) {
    //       var definitions = this.config_provider_service.getLevelDefinition(this.view_state_service.getcurClickLevelName()).attributeDefinitions[this.view_state_service.getCurAttrIndex(this.view_state_service.getcurClickLevelName())].legalLabels;
    //       e.preventDefault();
    //       e.stopPropagation();
    //       LevelService.deleteEditArea();
    //       this.view_state_service.setEditing(false);
    //       modalService.open('views/error.html', 'Editing Error: Sorry, characters allowed on this Level are "' + JSON.stringify(definitions) + '"');
    //     }
    //     // save text on enter if saving is allowed
    //     if (this.view_state_service.isSavingAllowed() && code === this.config_provider_service.vals.keyMappings.createNewItemAtSelection) {
    //       var editingElement = LevelService.getItemFromLevelById(this.view_state_service.getcurClickLevelName(), LevelService.getlastID());
    //       attrIndex = this.view_state_service.getCurAttrIndex(this.view_state_service.getcurClickLevelName());
    //       oldValue = '';
    //       newValue = '';
    //       if (editingElement.labels[attrIndex] !== undefined) {
    //         oldValue = editingElement.labels[attrIndex].value;
    //       }
    //       // get new value from dom element or from this.view_state_service.largeTextFieldInputFieldCurLabel if it is used
    //       if(this.config_provider_service.vals.restrictions.useLargeTextInputField){
    //         newValue = this.view_state_service.largeTextFieldInputFieldCurLabel;
    //       }else{
    //         newValue = domElement.val();
    //       }
    //
    //       LevelService.renameLabel(this.view_state_service.getcurClickLevelName(), LevelService.getlastID(), this.view_state_service.getCurAttrIndex(this.view_state_service.getcurClickLevelName()), newValue);
    //       HistoryService.addObjToUndoStack({
    //         'type': 'ANNOT',
    //         'action': 'RENAMELABEL',
    //         'name': this.view_state_service.getcurClickLevelName(),
    //         'id': LevelService.getlastID(),
    //         'attrIndex': attrIndex,
    //         'oldValue': oldValue,
    //         'newValue': newValue
    //       });
    //       LevelService.deleteEditArea();
    //       this.view_state_service.setEditing(false);
    //       this.view_state_service.selectItems(LevelService.getItemFromLevelById(this.view_state_service.getcurClickLevelName(), LevelService.getlastID()));
    //     }
    //     // escape from text if esc
    //     if (code === this.config_provider_service.vals.keyMappings.esc) {
    //       LevelService.deleteEditArea();
    //       this.view_state_service.setEditing(false);
    //     }
    //
    //     // playAllInView
    //     if (code === this.config_provider_service.vals.keyMappings.playAllInView && e.altKey) {
    //       if (this.view_state_service.getPermission('playaudio')) {
    //         if (this.config_provider_service.vals.restrictions.playback) {
    //           this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS);
    //           this.view_state_service.animatePlayHead(this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS);
    //         }
    //       }
    //     }
    //
    //     // playSelected
    //     if (code === 3 && e.altKey) { // this.config_provider_service.vals.keyMappings.playSelected
    //       if (this.view_state_service.getPermission('playaudio')) {
    //         if (this.config_provider_service.vals.restrictions.playback) {
    //           this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
    //           this.view_state_service.animatePlayHead(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
    //         }
    //       }
    //     }
    //
    //     // playEntireFile
    //     if (code === this.config_provider_service.vals.keyMappings.playEntireFile && e.altKey) {
    //       if (this.view_state_service.getPermission('playaudio')) {
    //         if (this.config_provider_service.vals.restrictions.playback) {
    //           this.sound_handler_service.playFromTo(0, this.sound_handler_service.audioBuffer.length);
    //           this.view_state_service.animatePlayHead(0, this.sound_handler_service.audioBuffer.length);
    //         }
    //       }
    //     }
    //
    //
    //   } else if (this.view_state_service.getcursorInTextField() === false) {
    //
    //     LevelService.deleteEditArea();
    //
    //
        // escape from open modal dialog
        //
        // if (this.view_state_service.curState.permittedActions.length === 0 &&
        //   code === this.config_provider_service.vals.keyMappings.esc &&
        //   modalService.force === false) {
        //   modalService.close();
        // }


        // delegate keyboard keyMappings according to keyMappings of scope
        // showHierarchy
    //     if (code === this.config_provider_service.vals.keyMappings.showHierarchy && this.config_provider_service.vals.activeButtons.showHierarchy) {
    //       if (this.view_state_service.curState !== this.view_state_service.states.noDBorFilesloaded) {
    //         if (this.view_state_service.hierarchyState.isShown()) {
    //           modalService.close();
    //         } else {
    //           this.view_state_service.hierarchyState.toggleHierarchy();
    //           modalService.open('views/showHierarchyModal.html');
    //         }
    //       }
    //     }

    // zoomAll
    this.hotkey_q = this.hotkeys_service.add(new Hotkey('q', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('zoom')) {
        this.view_state_service.setViewPort(0, this.sound_handler_service.audioBuffer.length);
      } else {
        //console.log('zoom all action currently not allowed');
      }
      return false; // Prevent bubbling
    }));

    // zoomIn
    this.hotkey_w = this.hotkeys_service.add(new Hotkey('w', (event: KeyboardEvent): boolean => {
        if (this.view_state_service.getPermission('zoom')) {
          this.view_state_service.zoomViewPort(true);
        } else {
          //console.log('action currently not allowed');
        }
      return false; // Prevent bubbling
    }));


    // zoomOut
    this.hotkey_s = this.hotkeys_service.add(new Hotkey('s', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('zoom')) {
        this.view_state_service.zoomViewPort(false);
      } else {
        //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));



    // zoomSel
    this.hotkey_e = this.hotkeys_service.add(new Hotkey('e', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('zoom')) {
        this.view_state_service.setViewPort(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
      } else {
        //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));


    // shiftViewPortLeft
    this.hotkey_a = this.hotkeys_service.add(new Hotkey('a', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('zoom')) {
        this.view_state_service.shiftViewPort(false);
        } else {
        //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));


    // shiftViewPortRight
    this.hotkey_d = this.hotkeys_service.add(new Hotkey('d', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('zoom')) {
        this.view_state_service.shiftViewPort(true);
        } else {
        //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));



    // playEntireFile
    this.hotkey_f = this.hotkeys_service.add(new Hotkey('f', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('playaudio')) {
          if (this.config_provider_service.vals.restrictions.playback) {
            this.sound_handler_service.playFromTo(0, this.sound_handler_service.audioBuffer.length);
            this.view_state_service.animatePlayHead(0, this.sound_handler_service.audioBuffer.length, false);
          }
        } else {
          //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));

    // playAllInView
    this.hotkey_space = this.hotkeys_service.add(new Hotkey(['space', 'shift+space'], (event: KeyboardEvent): boolean => {

      if (this.view_state_service.getPermission('playaudio')) {
        if (this.config_provider_service.vals.restrictions.playback) {
          if(!event.shiftKey){
            this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS);
            this.view_state_service.animatePlayHead(this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS, false);
          }else{
            // playAllInView to end of file and autoscroll
            this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.sS, this.sound_handler_service.audioBuffer.length);
            this.view_state_service.animatePlayHead(this.view_state_service.curViewPort.sS, this.sound_handler_service.audioBuffer.length, true);
          }
        }
      } else {
              //console.log('action currently not allowed');
      }
      return false; // Prevent bubbling
    }));

    // playSelected
    this.hotkey_c = this.hotkeys_service.add(new Hotkey('c', (event: KeyboardEvent): boolean => {
        if (this.view_state_service.getPermission('playaudio')) {
          if (this.config_provider_service.vals.restrictions.playback) {
            this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
            this.view_state_service.animatePlayHead(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE, false);
          }
        } else {
          //console.log('action currently not allowed');
        }
      return false; // Prevent bubbling
    }));


    //
    //     // save bundle
    //     if (code === this.config_provider_service.vals.keyMappings.saveBndl) {
    //       if (this.view_state_service.getPermission('saveBndlBtnClick')) {
    //         dbObjLoadSaveService.saveBundle();
    //       }
    //     }
    //
    //
    //     // selectFirstContourCorrectionTool
    //     if (code === this.config_provider_service.vals.keyMappings.selectFirstContourCorrectionTool) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.correctionTool) {
    //           this.view_state_service.curCorrectionToolNr = 1;
    //         }
    //       }
    //     }
    //
    //     // selectSecondContourCorrectionTool
    //     if (code === this.config_provider_service.vals.keyMappings.selectSecondContourCorrectionTool) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.correctionTool) {
    //           this.view_state_service.curCorrectionToolNr = 2;
    //         }
    //       }
    //     }
    //     // selectThirdContourCorrectionTool
    //     if (code === this.config_provider_service.vals.keyMappings.selectThirdContourCorrectionTool) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.correctionTool) {
    //           this.view_state_service.curCorrectionToolNr = 3;
    //         }
    //       }
    //     }
    //     // selectFourthContourCorrectionTool
    //     if (code === this.config_provider_service.vals.keyMappings.selectFourthContourCorrectionTool) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.correctionTool) {
    //           this.view_state_service.curCorrectionToolNr = 4;
    //         }
    //       }
    //     }
    //     // selectNOContourCorrectionTool
    //     if (code === this.config_provider_service.vals.keyMappings.selectNoContourCorrectionTool) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.correctionTool) {
    //           this.view_state_service.curCorrectionToolNr = undefined;
    //         }
    //       }
    //     }

    // levelUp
    this.hotkey_up = this.hotkeys_service.add(new Hotkey('up', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('labelAction')) {
        this.view_state_service.selectLevel(false, this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.order, this.data_service); // pass in DataService to prevent circular deps
      }

      return false; // Prevent bubbling
    }));

    // levelDown
    this.hotkey_down = this.hotkeys_service.add(new Hotkey('down', (event: KeyboardEvent): boolean => {
      if (this.view_state_service.getPermission('labelAction')) {
        this.view_state_service.selectLevel(true, this.config_provider_service.vals.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.order, this.data_service); // pass DataService to prevent circular deps
      }
      return false; // Prevent bubbling
    }));

    //     // preselected boundary snap to top
    //     if (code === this.config_provider_service.vals.keyMappings.snapBoundaryToNearestTopBoundary) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           mouseSeg = this.view_state_service.getcurMouseItem();
    //           levelName = this.view_state_service.getcurMouseLevelName();
    //           levelType = this.view_state_service.getcurMouseLevelType();
    //           neighbor = this.view_state_service.getcurMouseNeighbours();
    //           minDist = LevelService.snapBoundary(true, levelName, mouseSeg, neighbor, levelType);
    //           if (minDist === false) {
    //             // error msg nothing moved / nothing on top
    //           } else {
    //             if (levelType === 'EVENT') {
    //               HistoryService.updateCurChangeObj({
    //                 'type': 'ANNOT',
    //                 'action': 'MOVEEVENT',
    //                 'name': levelName,
    //                 'id': mouseSeg.id,
    //                 'movedBy': minDist
    //               });
    //             } else if (levelType === 'SEGMENT') {
    //               HistoryService.updateCurChangeObj({
    //                 'type': 'ANNOT',
    //                 'action': 'MOVEBOUNDARY',
    //                 'name': levelName,
    //                 'id': mouseSeg.id,
    //                 'movedBy': minDist,
    //                 'position': 0
    //               });
    //             }
    //             HistoryService.addCurChangeObjToUndoStack();
    //           }
    //         }
    //       }
    //     }
    //
    //     // preselected boundary snap to bottom
    //     if (code === this.config_provider_service.vals.keyMappings.snapBoundaryToNearestBottomBoundary) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           mouseSeg = this.view_state_service.getcurMouseItem();
    //           levelName = this.view_state_service.getcurMouseLevelName();
    //           levelType = this.view_state_service.getcurMouseLevelType();
    //           neighbor = this.view_state_service.getcurMouseNeighbours();
    //           minDist = LevelService.snapBoundary(false, levelName, mouseSeg, neighbor, levelType);
    //           if (minDist === false) {
    //             // error msg nothing moved / nothing below
    //           } else {
    //             if (levelType === 'EVENT') {
    //               HistoryService.updateCurChangeObj({
    //                 'type': 'ANNOT',
    //                 'action': 'MOVEEVENT',
    //                 'name': levelName,
    //                 'id': mouseSeg.id,
    //                 'movedBy': minDist
    //               });
    //             } else if (levelType === 'SEGMENT') {
    //               HistoryService.updateCurChangeObj({
    //                 'type': 'ANNOT',
    //                 'action': 'MOVEBOUNDARY',
    //                 'name': levelName,
    //                 'id': mouseSeg.id,
    //                 'movedBy': minDist,
    //                 'position': 0
    //               });
    //             }
    //             HistoryService.addCurChangeObjToUndoStack();
    //           }
    //         }
    //       }
    //     }
    //
    //     // preselected boundary to nearest zero crossing
    //     if (code === this.config_provider_service.vals.keyMappings.snapBoundaryToNearestZeroCrossing) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           var dist;
    //           if (this.view_state_service.getcurMouseLevelType() === 'SEGMENT') {
    //             dist = LevelService.calcDistanceToNearestZeroCrossing(this.view_state_service.getcurMouseItem().sampleStart);
    //           } else {
    //             dist = LevelService.calcDistanceToNearestZeroCrossing(this.view_state_service.getcurMouseItem().samplePoint);
    //           }
    //           if (dist !== 0) {
    //             seg = this.view_state_service.getcurMouseItem();
    //             levelName = this.view_state_service.getcurMouseLevelName();
    //             LevelService.moveBoundary(levelName, seg.id, dist, this.view_state_service.getcurMouseisFirst(), this.view_state_service.getcurMouseisLast());
    //
    //             HistoryService.updateCurChangeObj({
    //               'type': 'ANNOT',
    //               'action': 'MOVEBOUNDARY',
    //               'name': levelName,
    //               'id': seg.id,
    //               'movedBy': dist,
    //               'isFirst': this.view_state_service.getcurMouseisFirst(),
    //               'isLast': this.view_state_service.getcurMouseisLast()
    //             });
    //
    //             HistoryService.addCurChangeObjToUndoStack();
    //           }
    //         }
    //       }
    //     }
    //
    //     var changeTime;
    //     // expand Segments
    //     if (code === this.config_provider_service.vals.keyMappings.expandSelSegmentsRight) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           if (this.view_state_service.getcurClickLevelName() === undefined) {
    //             modalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
    //           } else {
    //             if (this.view_state_service.getselected().length === 0) {
    //               modalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
    //             } else {
    //               changeTime = parseInt(this.config_provider_service.vals.labelCanvasConfig.addTimeValue, 10);
    //               if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'relative') {
    //                 changeTime = this.config_provider_service.vals.labelCanvasConfig.addTimeValue * (this.sound_handler_service.audioBuffer.length / 100);
    //               }
    //               LevelService.expandSegment(true, this.view_state_service.getcurClickItems(), this.view_state_service.getcurClickLevelName(), changeTime);
    //               HistoryService.addObjToUndoStack({
    //                 'type': 'ANNOT',
    //                 'action': 'EXPANDSEGMENTS',
    //                 'name': this.view_state_service.getcurClickLevelName(),
    //                 'item': this.view_state_service.getcurClickItems(),
    //                 'rightSide': true,
    //                 'changeTime': changeTime
    //               });
    //               this.view_state_service.selectBoundary();
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //     // expand Segment left
    //     if (code === this.config_provider_service.vals.keyMappings.expandSelSegmentsLeft) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           if (this.view_state_service.getcurClickLevelName() === undefined) {
    //             modalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
    //           } else {
    //             if (this.view_state_service.getselected().length === 0) {
    //               modalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
    //             } else {
    //               if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'absolute') {
    //                 changeTime = parseInt(this.config_provider_service.vals.labelCanvasConfig.addTimeValue, 10);
    //               } else if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'relative') {
    //                 changeTime = this.config_provider_service.vals.labelCanvasConfig.addTimeValue * (this.sound_handler_service.audioBuffer.length / 100);
    //               } else {
    //                 modalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
    //               }
    //               LevelService.expandSegment(false, this.view_state_service.getcurClickItems(), this.view_state_service.getcurClickLevelName(), changeTime);
    //               HistoryService.addObjToUndoStack({
    //                 'type': 'ANNOT',
    //                 'action': 'EXPANDSEGMENTS',
    //                 'name': this.view_state_service.getcurClickLevelName(),
    //                 'item': this.view_state_service.getcurClickItems(),
    //                 'rightSide': false,
    //                 'changeTime': changeTime
    //               });
    //               this.view_state_service.selectBoundary();
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //     // shrink Segments Left
    //     if (code === this.config_provider_service.vals.keyMappings.shrinkSelSegmentsLeft) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           if (this.view_state_service.getcurClickLevelName() === undefined) {
    //             modalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
    //           } else {
    //             if (this.view_state_service.getselected().length === 0) {
    //               modalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
    //             } else {
    //               if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'absolute') {
    //                 changeTime = parseInt(this.config_provider_service.vals.labelCanvasConfig.addTimeValue, 10);
    //               } else if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'relative') {
    //                 changeTime = this.config_provider_service.vals.labelCanvasConfig.addTimeValue * (this.sound_handler_service.audioBuffer.length / 100);
    //               } else {
    //                 modalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
    //               }
    //               LevelService.expandSegment(true, this.view_state_service.getcurClickItems(), this.view_state_service.getcurClickLevelName(), -changeTime);
    //               HistoryService.addObjToUndoStack({
    //                 'type': 'ANNOT',
    //                 'action': 'EXPANDSEGMENTS',
    //                 'name': this.view_state_service.getcurClickLevelName(),
    //                 'item': this.view_state_service.getcurClickItems(),
    //                 'rightSide': true,
    //                 'changeTime': -changeTime
    //               });
    //               this.view_state_service.selectBoundary();
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //
    //     // shrink Segments Right
    //     if (code === this.config_provider_service.vals.keyMappings.shrinkSelSegmentsRight) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.config_provider_service.vals.restrictions.editItemSize) {
    //           if (this.view_state_service.getcurClickLevelName() === undefined) {
    //             modalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
    //           } else {
    //             if (this.view_state_service.getselected().length === 0) {
    //               modalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
    //             } else {
    //               if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'absolute') {
    //                 changeTime = parseInt(this.config_provider_service.vals.labelCanvasConfig.addTimeValue, 10);
    //               } else if (this.config_provider_service.vals.labelCanvasConfig.addTimeMode === 'relative') {
    //                 changeTime = this.config_provider_service.vals.labelCanvasConfig.addTimeValue * (this.sound_handler_service.audioBuffer.length / 100);
    //               } else {
    //                 modalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
    //               }
    //               LevelService.expandSegment(false, this.view_state_service.getcurClickItems(), this.view_state_service.getcurClickLevelName(), -changeTime);
    //               HistoryService.addObjToUndoStack({
    //                 'type': 'ANNOT',
    //                 'action': 'EXPANDSEGMENTS',
    //                 'name': this.view_state_service.getcurClickLevelName(),
    //                 'item': this.view_state_service.getcurClickItems(),
    //                 'rightSide': false,
    //                 'changeTime': -changeTime
    //               });
    //               this.view_state_service.selectBoundary();
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //
    //     // toggleSideBars
    //     if (code === this.config_provider_service.vals.keyMappings.toggleSideBarLeft) {
    //       if (this.view_state_service.getPermission('toggleSideBars')) {
    //         // check if menu button in showing -> if not -> no submenu open
    //         if (this.config_provider_service.vals.activeButtons.openMenu) {
    //           this.view_state_service.toggleSubmenu(this.config_provider_service.design.animation.period);
    //         }
    //       }
    //     }
    //
    //     // toggleSideBars
    //     if (code === this.config_provider_service.vals.keyMappings.toggleSideBarRight) {
    //       if (this.view_state_service.getPermission('toggleSideBars')) {
    //         // check if menu button in showing -> if not -> no submenu open
    //         if (this.config_provider_service.vals.activeButtons.openMenu) {
    //           this.view_state_service.setRightsubmenuOpen(!this.view_state_service.getRightsubmenuOpen());
    //         }
    //       }
    //     }
    //
    //     // select Segments in viewport selection
    //     if (code === this.config_provider_service.vals.keyMappings.selectItemsInSelection) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.view_state_service.getcurClickLevelName() === undefined) {
    //           modalService.open('views/error.html', 'Selection Error : Please select a Level first');
    //         } else {
    //           this.view_state_service.selectedItems = [];
    //           var prev = null;
    //           angular.forEach(this.view_state_service.getItemsInSelection(DataService.data.levels), function (item) {
    //             if(prev === null) {
    //               this.view_state_service.selectItems(item);
    //             }
    //             else {
    //               this.view_state_service.setcurClickItemMultiple(item, prev);
    //             }
    //             prev = item;
    //           });
    //           this.view_state_service.selectBoundary();
    //         }
    //       }
    //     }
    //
    //     // selPrevItem (arrow key left)
    //     if (code === this.config_provider_service.vals.keyMappings.selPrevItem) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.view_state_service.getcurClickItems().length > 0) {
    //           lastNeighboursMove = LevelService.getItemNeighboursFromLevel(this.view_state_service.getcurClickLevelName(), this.view_state_service.getcurClickItems()[0].id, this.view_state_service.getcurClickItems()[this.view_state_service.getcurClickItems().length - 1].id);
    //           neighbours = LevelService.getItemNeighboursFromLevel(this.view_state_service.getcurClickLevelName(), lastNeighboursMove.left.id, lastNeighboursMove.left.id);
    //           if (lastNeighboursMove.left !== undefined) {
    //             if (lastNeighboursMove.left.sampleStart !== undefined) {
    //               // check if in view
    //               if (lastNeighboursMove.left.sampleStart > this.view_state_service.curViewPort.sS) {
    //                 if (e.shiftKey) { // select multiple while shift
    //                   this.view_state_service.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 } else {
    //                   this.view_state_service.selectItems(lastNeighboursMove.left);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 }
    //                 this.view_state_service.selectBoundary();
    //               }
    //             } else {
    //               // check if in view
    //               if (lastNeighboursMove.left.samplePoint > this.view_state_service.curViewPort.sS) {
    //                 if (e.shiftKey) { // select multiple while shift
    //                   this.view_state_service.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 } else {
    //                   this.view_state_service.selectItems(lastNeighboursMove.left);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 }
    //                 this.view_state_service.selectBoundary();
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //
    //
    //     // selNextItem (arrow key right)
    //     if (code === this.config_provider_service.vals.keyMappings.selNextItem) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.view_state_service.getcurClickItems().length > 0) {
    //           lastNeighboursMove = LevelService.getItemNeighboursFromLevel(this.view_state_service.getcurClickLevelName(), this.view_state_service.getcurClickItems()[0].id, this.view_state_service.getcurClickItems()[this.view_state_service.getcurClickItems().length - 1].id);
    //           neighbours = LevelService.getItemNeighboursFromLevel(this.view_state_service.getcurClickLevelName(), lastNeighboursMove.right.id, lastNeighboursMove.right.id);
    //           if (lastNeighboursMove.right !== undefined) {
    //             if (lastNeighboursMove.right.sampleStart !== undefined) {
    //               // check if in view
    //               if (lastNeighboursMove.right.sampleStart +  lastNeighboursMove.right.sampleDur < this.view_state_service.curViewPort.eS) {
    //                 if (e.shiftKey) { // select multiple while shift
    //                   this.view_state_service.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 } else {
    //                   this.view_state_service.selectItems(lastNeighboursMove.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 }
    //                 this.view_state_service.selectBoundary();
    //               }
    //             } else {
    //               // check if in view
    //               if (lastNeighboursMove.right.samplePoint < this.view_state_service.curViewPort.eS) {
    //                 if (e.shiftKey) { // select multiple while shift
    //                   this.view_state_service.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 } else {
    //                   this.view_state_service.selectItems(lastNeighboursMove.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 }
    //                 this.view_state_service.selectBoundary();
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //     // selNextPrevItem (tab key and tab+shift key)
    //     if (code === this.config_provider_service.vals.keyMappings.selNextPrevItem) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         if (this.view_state_service.getcurClickItems().length > 0) {
    //           var idLeft = this.view_state_service.getcurClickItems()[0].id;
    //           var idRight = this.view_state_service.getcurClickItems()[this.view_state_service.getcurClickItems().length - 1].id;
    //           lastNeighboursMove = LevelService.getItemNeighboursFromLevel(this.view_state_service.getcurClickLevelName(), idLeft, idRight);
    //           if (e.shiftKey) {
    //             if (lastNeighboursMove.left !== undefined) {
    //               if (lastNeighboursMove.left.sampleStart !== undefined) {
    //                 // check if in view
    //                 if (lastNeighboursMove.left.sampleStart >= this.view_state_service.curViewPort.sS) {
    //                   this.view_state_service.selectItems(lastNeighboursMove.left);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 }
    //               } else {
    //                 // check if in view
    //                 if (lastNeighboursMove.left.samplePoint >= this.view_state_service.curViewPort.sS) {
    //                   this.view_state_service.selectItems(lastNeighboursMove.left, lastNeighboursMove.left.id);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
    //                 }
    //               }
    //             }
    //           } else {
    //             if (lastNeighboursMove.right !== undefined) {
    //               if (lastNeighboursMove.right.sampleStart !== undefined) {
    //                 // check if in view
    //                 if (lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur <= this.view_state_service.curViewPort.eS) {
    //                   this.view_state_service.selectItems(lastNeighboursMove.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 }
    //               } else {
    //                 // check if in view
    //                 if (lastNeighboursMove.right.samplePoint < this.view_state_service.curViewPort.eS) {
    //                   this.view_state_service.selectItems(lastNeighboursMove.right);
    //                   LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //     // createNewItemAtSelection
    //     if (code === this.config_provider_service.vals.keyMappings.createNewItemAtSelection) {
    //       // auto action in model when open and user presses 'enter'
    //       if (modalService.isOpen) {
    //         if(modalService.force === false){
    //           modalService.confirmContent();
    //         }
    //       }
    //       else {
    //         if (this.view_state_service.curClickLevelIndex === undefined) {
    //           modalService.open('views/error.html', 'Modify Error: Please select a Segment or Event Level first.');
    //         }
    //         else {
    //           if (this.view_state_service.getPermission('labelAction')) {
    //             if (this.config_provider_service.vals.restrictions.addItem) {
    //               if (this.view_state_service.getselectedRange().start === this.view_state_service.curViewPort.selectS && this.view_state_service.getselectedRange().end === this.view_state_service.curViewPort.selectE) {
    //                 if (this.view_state_service.getcurClickItems().length === 1) {
    //                   // check if in view
    //                   if (this.view_state_service.getselectedRange().start >= this.view_state_service.curViewPort.sS && this.view_state_service.getselectedRange().end <= this.view_state_service.curViewPort.eS) {
    //                     this.view_state_service.setEditing(true);
    //                     LevelService.openEditArea(this.view_state_service.getcurClickItems()[0], LevelService.getlasteditAreaElem(), this.view_state_service.getcurClickLevelType());
    //                     scope.cursorInTextField();
    //                   }
    //                 } else {
    //                   modalService.open('views/error.html', 'Modify Error: Please select a single Segment.');
    //                 }
    //               } else {
    //                 if (this.view_state_service.curViewPort.selectE === -1 && this.view_state_service.curViewPort.selectS === -1) {
    //                   modalService.open('views/error.html', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
    //                 } else {
    //                   seg = LevelService.getClosestItem(this.view_state_service.curViewPort.selectS, this.view_state_service.getcurClickLevelName(), this.sound_handler_service.audioBuffer.length).current;
    //                   if (this.view_state_service.getcurClickLevelType() === 'SEGMENT') {
    //                     if (seg === undefined) {
    //                       insSeg = LevelService.insertSegment(this.view_state_service.getcurClickLevelName(), this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE, this.config_provider_service.vals.labelCanvasConfig.newSegmentName);
    //                       if (!insSeg.ret) {
    //                         modalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
    //                       } else {
    //                         HistoryService.addObjToUndoStack({
    //                           'type': 'ANNOT',
    //                           'action': 'INSERTSEGMENTS',
    //                           'name': this.view_state_service.getcurClickLevelName(),
    //                           'start': this.view_state_service.curViewPort.selectS,
    //                           'end': this.view_state_service.curViewPort.selectE,
    //                           'ids': insSeg.ids,
    //                           'segName': this.config_provider_service.vals.labelCanvasConfig.newSegmentName
    //                         });
    //                       }
    //                     } else {
    //                       if (seg.sampleStart === this.view_state_service.curViewPort.selectS && (seg.sampleStart + seg.sampleDur + 1) === this.view_state_service.curViewPort.selectE) {
    //                         LevelService.setlasteditArea('_' + seg.id);
    //                         LevelService.openEditArea(seg, LevelService.getlasteditAreaElem(), this.view_state_service.getcurClickLevelType());
    //                         this.view_state_service.setEditing(true);
    //                       } else {
    //                         insSeg = LevelService.insertSegment(this.view_state_service.getcurClickLevelName(), this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE, this.config_provider_service.vals.labelCanvasConfig.newSegmentName);
    //                         if (!insSeg.ret) {
    //                           modalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
    //                         } else {
    //                           HistoryService.addObjToUndoStack({
    //                             'type': 'ANNOT',
    //                             'action': 'INSERTSEGMENTS',
    //                             'name': this.view_state_service.getcurClickLevelName(),
    //                             'start': this.view_state_service.curViewPort.selectS,
    //                             'end': this.view_state_service.curViewPort.selectE,
    //                             'ids': insSeg.ids,
    //                             'segName': this.config_provider_service.vals.labelCanvasConfig.newSegmentName
    //                           });
    //                         }
    //                       }
    //                     }
    //                   } else {
    //                     var levelDef = this.config_provider_service.getLevelDefinition(this.view_state_service.getcurClickLevelName());
    //                     if (typeof levelDef.anagestConfig === 'undefined') {
    //                       var insPoint = LevelService.insertEvent(this.view_state_service.getcurClickLevelName(), this.view_state_service.curViewPort.selectS, this.config_provider_service.vals.labelCanvasConfig.newEventName);
    //                       if (insPoint.alreadyExists) {
    //                         LevelService.setlasteditArea('_' + seg.id);
    //                         LevelService.openEditArea(seg, LevelService.getlasteditAreaElem(), this.view_state_service.getcurClickLevelType());
    //                         this.view_state_service.setEditing(true);
    //                       } else {
    //                         HistoryService.addObjToUndoStack({
    //                           'type': 'ANNOT',
    //                           'action': 'INSERTEVENT',
    //                           'name': this.view_state_service.getcurClickLevelName(),
    //                           'start': this.view_state_service.curViewPort.selectS,
    //                           'id': insPoint.id,
    //                           'pointName': this.config_provider_service.vals.labelCanvasConfig.newEventName
    //                         });
    //                       }
    //                     } else {
    //                       AnagestService.insertAnagestEvents();
    //                     }
    //                   }
    //                 }
    //               }
    //             } else {
    //             }
    //           }
    //         }
    //       }
    //     }
    //
    //
    //     // undo
    //     if (code === this.config_provider_service.vals.keyMappings.undo) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         HistoryService.undo();
    //       }
    //     }
    //
    //
    //     // redo
    //     if (code === this.config_provider_service.vals.keyMappings.redo) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         HistoryService.redo();
    //       }
    //     }
    //
    //     if (e.originalEvent.code === 'Digit1' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(0, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit2' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(1, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit3' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(2, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit4' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(3, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit5' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(4, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit6' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(5, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit7' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(6, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit8' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(7, this.config_provider_service.vals.perspectives);
    //     }
    //     if (e.originalEvent.code === 'Digit9' && e.shiftKey) {
    //       this.view_state_service.switchPerspective(8, this.config_provider_service.vals.perspectives);
    //     }
    //
    //     // deletePreselBoundary
    //     if (code === this.config_provider_service.vals.keyMappings.deletePreselBoundary) {
    //       if (this.view_state_service.getPermission('labelAction')) {
    //         e.preventDefault();
    //         seg = this.view_state_service.getcurMouseItem();
    //         var cseg = this.view_state_service.getcurClickItems();
    //         var isFirst = this.view_state_service.getcurMouseisFirst();
    //         var isLast = this.view_state_service.getcurMouseisLast();
    //         levelName = this.view_state_service.getcurMouseLevelName();
    //         var type = this.view_state_service.getcurMouseLevelType();
    //         if (!e.shiftKey) {
    //           if (this.config_provider_service.vals.restrictions.deleteItemBoundary) {
    //             if (seg !== undefined) {
    //               var neighbour = LevelService.getItemNeighboursFromLevel(levelName, seg.id, seg.id);
    //               if (type === 'SEGMENT') {
    //                 deletedSegment = LevelService.deleteBoundary(levelName, seg.id, isFirst, isLast);
    //                 HistoryService.updateCurChangeObj({
    //                   'type': 'ANNOT',
    //                   'action': 'DELETEBOUNDARY',
    //                   'name': levelName,
    //                   'id': seg.id,
    //                   'isFirst': isFirst,
    //                   'isLast': isLast,
    //                   'deletedSegment': deletedSegment
    //                 });
    //                 if (neighbour.left !== undefined) {
    //                   deletedLinks = LinkService.deleteLinkBoundary(seg.id, neighbour.left.id, LevelService);
    //                   HistoryService.updateCurChangeObj({
    //                     'type': 'ANNOT',
    //                     'action': 'DELETELINKBOUNDARY',
    //                     'name': levelName,
    //                     'id': seg.id,
    //                     'neighbourId': neighbour.left.id,
    //                     'deletedLinks': deletedLinks
    //                   });
    //                 } else {
    //                   deletedLinks = LinkService.deleteLinkBoundary(seg.id, -1, LevelService);
    //                   HistoryService.updateCurChangeObj({
    //                     'type': 'ANNOT',
    //                     'action': 'DELETELINKBOUNDARY',
    //                     'name': levelName,
    //                     'id': seg.id,
    //                     'neighbourId': -1,
    //                     'deletedLinks': deletedLinks
    //                   });
    //                 }
    //                 HistoryService.addCurChangeObjToUndoStack();
    //                 lastEventMove = LevelService.getClosestItem(this.view_state_service.getLasPcm() + this.view_state_service.curViewPort.sS, levelName, this.sound_handler_service.audioBuffer.length);
    //                 if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
    //                   lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
    //                   this.view_state_service.preselectItem(lastEventMove.nearest, lastNeighboursMove, this.view_state_service.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
    //                 }
    //                 this.view_state_service.selectItems(deletedSegment.clickSeg);
    //               } else {
    //                 var deletedPoint = LevelService.deleteEvent(levelName, seg.id);
    //                 if (deletedPoint !== false) {
    //                   HistoryService.updateCurChangeObj({
    //                     'type': 'ANNOT',
    //                     'action': 'DELETEEVENT',
    //                     'name': levelName,
    //                     'start': deletedPoint.samplePoint,
    //                     'id': deletedPoint.id,
    //                     'pointName': deletedPoint.labels[0].value
    //
    //                   });
    //                   HistoryService.addCurChangeObjToUndoStack();
    //                   lastEventMove = LevelService.getClosestItem(this.view_state_service.getLasPcm() + this.view_state_service.curViewPort.sS, levelName, this.sound_handler_service.audioBuffer.length);
    //                   if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
    //                     lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
    //                     this.view_state_service.preselectItem(lastEventMove.nearest, lastNeighboursMove, this.view_state_service.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
    //                   }
    //                 } else {
    //                   this.view_state_service.preselectItem(undefined, undefined, undefined, undefined, undefined);
    //                 }
    //               }
    //             }
    //           }
    //         } else {
    //           if (this.config_provider_service.vals.restrictions.deleteItem) {
    //             if (cseg !== undefined && cseg.length > 0) {
    //               if (this.view_state_service.getcurClickLevelType() === 'SEGMENT') {
    //                 deletedSegment = LevelService.deleteSegments(levelName, cseg[0].id, cseg.length);
    //                 HistoryService.updateCurChangeObj({
    //                   'type': 'ANNOT',
    //                   'action': 'DELETESEGMENTS',
    //                   'name': levelName,
    //                   'id': cseg[0].id,
    //                   'length': cseg.length,
    //                   'deletedSegment': deletedSegment
    //                 });
    //                 deletedLinks = LinkService.deleteLinkSegment(cseg);
    //                 HistoryService.updateCurChangeObj({
    //                   'type': 'ANNOT',
    //                   'action': 'DELETELINKSEGMENT',
    //                   'name': levelName,
    //                   'segments': cseg,
    //                   'deletedLinks': deletedLinks
    //                 });
    //                 HistoryService.addCurChangeObjToUndoStack();
    //                 lastEventMove = LevelService.getClosestItem(this.view_state_service.getLasPcm() + this.view_state_service.curViewPort.sS, levelName, this.sound_handler_service.audioBuffer.length);
    //                 if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
    //                   lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
    //                   this.view_state_service.preselectItem(lastEventMove.nearest, lastNeighboursMove, this.view_state_service.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
    //                 }
    //                 this.view_state_service.selectItems(deletedSegment.clickSeg);
    //               } else {
    //                 modalService.open('views/error.html', 'Delete Error: You can not delete Segments on Point Levels.');
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //     if (!e.metaKey && !e.ctrlKey) {
    //       e.preventDefault();
    //       e.stopPropagation();
    //     }
    //   }
    // };

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.hotkeys_service.remove(this.hotkey_q);
    this.hotkeys_service.remove(this.hotkey_e);

    this.hotkeys_service.remove(this.hotkey_w);
    this.hotkeys_service.remove(this.hotkey_a);
    this.hotkeys_service.remove(this.hotkey_s);
    this.hotkeys_service.remove(this.hotkey_d);

    this.hotkeys_service.remove(this.hotkey_f);
    this.hotkeys_service.remove(this.hotkey_space);
    this.hotkeys_service.remove(this.hotkey_c);

    this.hotkeys_service.remove(this.hotkey_up);
    this.hotkeys_service.remove(this.hotkey_down);
  }


  ///////////////////////////////
  // top menu:

  /**
   *
   */
  connectBtnClick() {
    // if (this.view_state_service.getPermission('connectBtnClick')) {
      let dialog_ref = this.connectDialog.open(ConnectComponent);
      dialog_ref.afterClosed().subscribe(result => {
        console.log(result);
        if(result !== "cancel"){
          // modalService.open('views/connectModal.html').then(function (url) {
          //   if (url) {
              this.view_state_service.somethingInProgress.next('Connecting to server...');
              // this.view_state_service.somethingInProgress = true;
              this.view_state_service.url = result;
              this.io_handler_service.wsh.initConnect(result).subscribe((message) => {
                if (message.type === 'error') {
          //         modalService.open('views/error.html', 'Could not connect to websocket server: ' + url).then(function () {
                    this.app_state_service.resetToInitState();
          //         });
                } else {
                  // don't know about this
                  this.app_component.handleConnectedToWSserver({session: null, reload: null});
                }
          //     }, function (errMess) {
          //       modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(function () {
          //         appStateService.resetToInitState();
          //       });
          //     });
          //   }
          });
        }
      });

    // } else {
    //
    // }
  }

  /////////////////////////////////////////
  // handle button clicks

  // top menu:
  /**
   *
   */
  // $scope.addLevelSegBtnClick = function () {
  //   if (viewState.getPermission('addLevelSegBtnClick')) {
  //     var length = 0;
  //     if (DataService.data.levels !== undefined) {
  //       length = DataService.data.levels.length;
  //     }
  //     var newName = 'levelNr' + length;
  //     var level = {
  //       items: [],
  //       name: newName,
  //       type: 'SEGMENT'
  //     };
  //
  //     if (viewState.getCurAttrDef(newName) === undefined) {
  //       var leveldef = {
  //         'name': newName,
  //         'type': 'EVENT',
  //         'attributeDefinitions': {
  //           'name': newName,
  //           'type': 'string'
  //         }
  //       };
  //       viewState.setCurLevelAttrDefs(leveldef);
  //     }
  //     LevelService.insertLevel(level, length, viewState.curPerspectiveIdx);
  //     //  Add to history
  //     HistoryService.addObjToUndoStack({
  //       'type': 'ANNOT',
  //       'action': 'INSERTLEVEL',
  //       'level': level,
  //       'id': length,
  //       'curPerspectiveIdx': viewState.curPerspectiveIdx
  //     });
  //     viewState.selectLevel(false, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.addLevelPointBtnClick = function () {
  //
  //   if (viewState.getPermission('addLevelPointBtnClick')) {
  //     var length = 0;
  //     if (DataService.data.levels !== undefined) {
  //       length = DataService.data.levels.length;
  //     }
  //     var newName = 'levelNr' + length;
  //     var level = {
  //       items: [],
  //       name: newName,
  //       type: 'EVENT'
  //     };
  //     if (viewState.getCurAttrDef(newName) === undefined) {
  //       var leveldef = {
  //         name: newName,
  //         type: 'EVENT',
  //         attributeDefinitions: {
  //           name: newName,
  //           type: 'string'
  //         }
  //       };
  //       viewState.setCurLevelAttrDefs(leveldef);
  //     }
  //     LevelService.insertLevel(level, length, viewState.curPerspectiveIdx);
  //     //  Add to history
  //     HistoryService.addObjToUndoStack({
  //       'type': 'ANNOT',
  //       'action': 'INSERTLEVEL',
  //       'level': level,
  //       'id': length,
  //       'curPerspectiveIdx': viewState.curPerspectiveIdx
  //     });
  //     viewState.selectLevel(false, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.renameSelLevelBtnClick = function () {
  //   if (viewState.getPermission('renameSelLevelBtnClick')) {
  //     if (viewState.getcurClickLevelName() !== undefined) {
  //       modalService.open('views/renameLevel.html', viewState.getcurClickLevelName());
  //     } else {
  //       modalService.open('views/error.html', 'Rename Error : Please choose a Level first !');
  //     }
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.downloadTextGridBtnClick = function () {
  //   if (viewState.getPermission('downloadTextGridBtnClick')) {
  //     Textgridparserservice.asyncToTextGrid().then(function (parseMess) {
  //       parseMess = parseMess.replace(/\t/g, '    '); // replace all tabs with 4 spaces
  //       modalService.open('views/export.html', loadedMetaDataService.getCurBndl().name + '.TextGrid', parseMess);
  //     });
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.downloadAnnotationBtnClick = function () {
  //   if (viewState.getPermission('downloadAnnotationBtnClick')) {
  //     if(Validationservice.validateJSO('emuwebappConfigSchema', DataService.getData())) {
  //       modalService.open('views/export.html', loadedMetaDataService.getCurBndl().name + '_annot.json', angular.toJson(DataService.getData(), true));
  //     }
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.spectSettingsBtnClick = function () {
  //   if (viewState.getPermission('spectSettingsChange')) {
  //     modalService.open('views/spectSettings.html');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.connectBtnClick = function () {
  //   if (viewState.getPermission('connectBtnClick')) {
  //     modalService.open('views/connectModal.html').then(function (url) {
  //       if (url) {
  //         viewState.somethingInProgressTxt = 'Connecting to server...';
  //         viewState.somethingInProgress = true;
  //         viewState.url = url;
  //         Iohandlerservice.wsH.initConnect(url).then(function (message) {
  //           if (message.type === 'error') {
  //             modalService.open('views/error.html', 'Could not connect to websocket server: ' + url).then(function () {
  //               appStateService.resetToInitState();
  //             });
  //           } else {
  //             $scope.handleConnectedToWSserver({session: null, reload: null});
  //           }
  //         }, function (errMess) {
  //           modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(function () {
  //             appStateService.resetToInitState();
  //           });
  //         });
  //       }
  //     });
  //   } else {
  //
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.openDemoDBbtnClick = function (nameOfDB) {
  //   if (viewState.getPermission('openDemoBtnDBclick')) {
  //     $scope.dropdown = false;
  //     ConfigProviderService.vals.activeButtons.openDemoDB = false;
  //     loadedMetaDataService.setDemoDbName(nameOfDB);
  //     // hide drop zone
  //     viewState.showDropZone = false;
  //
  //     viewState.somethingInProgress = true;
  //     // alert(nameOfDB);
  //     viewState.setState('loadingSaving');
  //     ConfigProviderService.vals.main.comMode = 'DEMO';
  //     viewState.somethingInProgressTxt = 'Loading DB config...';
  //     Iohandlerservice.httpGetDefaultDesign().then(function onSuccess(response) {
  //       ConfigProviderService.setDesign(response.data);
  //       Iohandlerservice.getDBconfigFile(nameOfDB).then(function (res) {
  //         var data = res.data;
  //         // first element of perspectives is default perspective
  //         viewState.curPerspectiveIdx = 0;
  //         ConfigProviderService.setVals(data.EMUwebAppConfig);
  //
  //         var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
  //         if (validRes === true) {
  //           ConfigProviderService.curDbConfig = data;
  //           viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
  //           validRes = Validationservice.validateJSO('DBconfigFileSchema', ConfigProviderService.curDbConfig);
  //
  //           if (validRes === true) {
  //             // then get the DBconfigFile
  //             viewState.somethingInProgressTxt = 'Loading bundle list...';
  //
  //             Iohandlerservice.getBundleList(nameOfDB).then(function (res) {
  //               var bdata = res.data;
  //               // validRes = Validationservice.validateJSO('bundleListSchema', bdata);
  //               // if (validRes === true) {
  //               loadedMetaDataService.setBundleList(bdata);
  //               // show standard buttons
  //               ConfigProviderService.vals.activeButtons.clear = true;
  //               ConfigProviderService.vals.activeButtons.specSettings = true;
  //
  //               // then load first bundle in list
  //               dbObjLoadSaveService.loadBundle(loadedMetaDataService.getBundleList()[0]);
  //
  //             }, function (err) {
  //               modalService.open('views/error.html', 'Error loading bundle list of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(function () {
  //                 appStateService.resetToInitState();
  //               });
  //             });
  //           } else {
  //             modalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(function () {
  //               appStateService.resetToInitState();
  //             });
  //           }
  //
  //
  //         } else {
  //           modalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(function () {
  //             appStateService.resetToInitState();
  //           });
  //         }
  //
  //       }, function (err) {
  //         modalService.open('views/error.html', 'Error loading DB config of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(function () {
  //           appStateService.resetToInitState();
  //         });
  //       });
  //     });
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.aboutBtnClick = function () {
  //   if (viewState.getPermission('aboutBtnClick')) {
  //     modalService.open('views/help.html');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.showHierarchyBtnClick = function () {
  //   if (!viewState.hierarchyState.isShown()) {
  //     viewState.hierarchyState.toggleHierarchy();
  //     modalService.open('views/showHierarchyModal.html');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.showEditDBconfigBtnClick = function () {
  //   modalService.open('views/tabbed.html').then(function (res) {
  //     if (res === false) {
  //       // do nothing when user clicks on cancle
  //     }
  //     else {
  //       if (Validationservice.validateJSO('emuwebappConfigSchema', res)) {
  //         $scope.cps.getDelta(res).then(function (delta) {
  //           Iohandlerservice.saveConfiguration(angular.toJson(delta, true)).then(function () {
  //             if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
  //               modalService.open('views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.').then(function (res) {
  //                 if (res) {
  //                   appStateService.reloadToInitState();
  //                 }
  //               });
  //             }
  //             else {
  //               appStateService.reloadToInitState($scope.lmds.getCurBndl());
  //             }
  //           });
  //         });
  //       }
  //       else {
  //         modalService.open('views/error.html', 'Sorry, there were errors in your configuration.');
  //       }
  //     }
  //   });
  // };
  //
  //
  // /**
  //  *
  //  */
  // $scope.searchBtnClick = function () {
  //   if (viewState.getPermission('searchBtnClick')) {
  //     modalService.open('views/searchAnnot.html');
  //   }
  // };


  /**
   *
   */
  public clearBtnClick () {
    // viewState.setdragBarActive(false);
    let dialogText;
    let dialog_ref = this.confirmDialog.open(ConfirmDialogComponent);
    if ((this.history_service.movesAwayFromLastSave !== 0 && this.config_provider_service.vals.main.comMode !== 'DEMO')) {
      dialogText = 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.';
    } else {
      dialogText = 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.';
    }

    // modalService.open('views/confirmModal.html', modalText).then(function (res) {
    //   if (res) {
    //     appStateService.resetToInitState();
    //   }
    // });

    dialog_ref.componentInstance.setText(dialogText);
    dialog_ref.afterClosed().subscribe(result => {
      if(result === 'confirm'){
        this.app_state_service.resetToInitState();
      }
    });

  }

  // bottom menu:

  /**
   *
   */
  public cmdZoomAll() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.setViewPort(0, this.sound_handler_service.audioBuffer.length);
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *
   */
  public cmdZoomIn() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.zoomViewPort(true);
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *
   */
  cmdZoomOut() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.zoomViewPort(false);
    } else {
      //console.log('action currently not allowed');
    }
  };

  /**
   *
   */
  cmdZoomLeft() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.shiftViewPort(false);
    } else {
      //console.log('action currently not allowed');
    }
  };

  /**
   *
   */
  cmdZoomRight() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.shiftViewPort(true);
    } else {
      //console.log('action currently not allowed');
    }
  };

  /**
   *
   */
  cmdZoomSel() {
    if (this.view_state_service.getPermission('zoom')) {
      // this.level_service.deleteEditArea(); @todo how do we do this after editArea was moved from service to component?
      this.view_state_service.setViewPort(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *
   */
  cmdPlayView() {
    if (this.view_state_service.getPermission('playaudio')) {
      this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.sS, this.view_state_service.curViewPort.eS);
      this.view_state_service.animatePlayHead(
        this.view_state_service.curViewPort.sS,
        this.view_state_service.curViewPort.eS,
        false);
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *
   */
  cmdPlaySel() {
    if (this.view_state_service.getPermission('playaudio')) {
      this.sound_handler_service.playFromTo(this.view_state_service.curViewPort.selectS, this.view_state_service.curViewPort.selectE);
      this.view_state_service.animatePlayHead(
        this.view_state_service.curViewPort.selectS,
        this.view_state_service.curViewPort.selectE,
        false
      );
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *sou
   */
  cmdPlayAll() {
    if (this.view_state_service.getPermission('playaudio')) {
      this.sound_handler_service.playFromTo(0, this.sound_handler_service.audioBuffer.length);
      this.view_state_service.animatePlayHead(
        0,
        this.sound_handler_service.audioBuffer.length,
        false);
    } else {
      //console.log('action currently not allowed');
    }
  }

  ///////////////////
  // hotkeys ()




}
