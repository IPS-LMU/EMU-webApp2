import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

import { DataService } from "../_services/data.service";
import { ConfigProviderService } from "../_services/config-provider.service";
import { ViewStateService } from "../_services/view-state.service";
import { SoundHandlerService } from "../_services/sound-handler.service";
import { LevelService } from "../_services/level.service"

@Component({
  selector: 'app-mainlayout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainlayoutComponent implements OnInit {

  constructor(private mat_icon_registry: MatIconRegistry,
              private dom_sanitizer: DomSanitizer,
              public data_service: DataService,
              public config_provider_service: ConfigProviderService,
              public view_state_service: ViewStateService,
              public sound_handler_service: SoundHandlerService,
              private level_service: LevelService) {

    this.mat_icon_registry.addSvgIcon(
      'EMUwebAppEmu',
      this.dom_sanitizer.bypassSecurityTrustResourceUrl('assets/EMU-webAppEmu.svg')
    );

  }

  ngOnInit() {
  }

  // bottom menu:

  /**
   *
   */
  public cmdZoomAll() {
    if (this.view_state_service.getPermission('zoom')) {
      this.level_service.deleteEditArea();
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
      this.level_service.deleteEditArea();
      this.view_state_service.zoomViewPort(true, this.level_service);
    } else {
      //console.log('action currently not allowed');
    }
  }

  /**
   *
   */
  cmdZoomOut() {
    if (this.view_state_service.getPermission('zoom')) {
      this.level_service.deleteEditArea();
      this.view_state_service.zoomViewPort(false, this.level_service);
    } else {
      //console.log('action currently not allowed');
    }
  };

  /**
   *
   */
  cmdZoomLeft() {
    if (this.view_state_service.getPermission('zoom')) {
      this.level_service.deleteEditArea();
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
      this.level_service.deleteEditArea();
      this.view_state_service.shiftViewPort(true);
    } else {
      //console.log('action currently not allowed');
    }
  };

  // /**
  //  *
  //  */
  // $scope.cmdZoomSel = function () {
  //   if (viewState.getPermission('zoom')) {
  //     LevelService.deleteEditArea();
  //     viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
  //   } else {
  //     //console.log('action currently not allowed');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.cmdPlayView = function () {
  //   if (viewState.getPermission('playaudio')) {
  //     Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
  //     viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
  //   } else {
  //     //console.log('action currently not allowed');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.cmdPlaySel = function () {
  //   if (viewState.getPermission('playaudio')) {
  //     Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
  //     viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
  //   } else {
  //     //console.log('action currently not allowed');
  //   }
  // };
  //
  // /**
  //  *
  //  */
  // $scope.cmdPlayAll = function () {
  //   if (viewState.getPermission('playaudio')) {
  //     Soundhandlerservice.playFromTo(0, Soundhandlerservice.audioBuffer.length);
  //     viewState.animatePlayHead(0, Soundhandlerservice.audioBuffer.length);
  //   } else {
  //     //console.log('action currently not allowed');
  //   }
  // };

}
