import { Component, OnInit } from '@angular/core';

import { LoadedMetaDataService } from '../_services/loaded-meta-data.service';
import { DbObjLoadSaveService } from '../_services/db-obj-load-save.service';

@Component({
  selector: 'app-bundle-list-side-bar',
  templateUrl: './bundle-list-side-bar.component.html',
  styleUrls: ['./bundle-list-side-bar.component.scss']
})
export class BundleListSideBarComponent implements OnInit {

  objectValues = Object.values;
  objectKeys = Object.keys;
  objectEntries = Object.entries;

  constructor(public loaded_meta_data_service: LoadedMetaDataService,
              public db_obj_load_save_service: DbObjLoadSaveService) { }

  ngOnInit() {
  }

}
