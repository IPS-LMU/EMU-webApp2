import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ConfirmDialogComponent } from '../confirm/confirm.component';
import { ViewStateService } from '../../_services/view-state.service';
import { ConfigProviderService } from '../../_services/config-provider.service';


@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent implements OnInit{

  curURL: string;
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              public config_provider_service: ConfigProviderService,
              private view_state_service: ViewStateService) { }

  ngOnInit(){
    this.curURL = this.config_provider_service.vals.main.serverUrl;
  }

  /**
   *  Save a URL
   */
  public saveURL = function () {
    // let currentURLS = $scope.getURLs();
    // if (currentURLS.indexOf(modalService.dataOut) === -1) {
    //   currentURLS.push(modalService.dataOut);
    // }
    // localStorage.setItem('urls', JSON.stringify(currentURLS));
    // $scope.myUrls = currentURLS;
    // $scope.mySelect = $scope.myUrls[0];
  };

  /**
   *  Return all URLs from localStorage
   */
  public getURLs = function () {
    let curVal = localStorage.getItem('urls');
    let urlData = [];
    // if (!browserDetector.isBrowser.PhantomJS() && curVal !== null) {
      urlData = JSON.parse(curVal);
    // }
    return urlData;
  };

  /**
   *  Return all URLs from localStorage
   */
  public letsetCurrentURL = function (data) {
    // modalService.dataOut = data;
  };


  /**
   *  delete a specific url
   */
  public deleteURL = function (data) {
    // let currentURLS = $scope.getURLs();
    // if (currentURLS.indexOf(data) !== -1) {
    //   currentURLS.splice(currentURLS.indexOf(data), 1);
    // }
    // localStorage.setItem('urls', JSON.stringify(currentURLS));
    // $scope.myUrls = currentURLS;
    // $scope.mySelect = $scope.myUrls[0];
  };

  /**
   *
   */
  public cursorInTextField = function () {
    this.view_state_service.setEditing(true);
    this.view_state_service.setcursorInTextField(true);
  }

  /**
   *
   */
  public cursorOutOfTextField = function () {
    this.view_state_service.setEditing(false);
    this.view_state_service.setcursorInTextField(false);
  }

}
