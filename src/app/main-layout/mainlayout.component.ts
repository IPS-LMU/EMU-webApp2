import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

import { DataService } from "../_services/data.service";
import { ConfigProviderService } from "../_services/config-provider.service";
import { ViewStateService } from "../_services/view-state.service";

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
              public view_state_service: ViewStateService) {

    this.mat_icon_registry.addSvgIcon(
      'EMUwebAppEmu',
      this.dom_sanitizer.bypassSecurityTrustResourceUrl('assets/EMU-webAppEmu.svg')
    );

  }

  ngOnInit() {
  }

}
