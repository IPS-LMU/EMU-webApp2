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
export class ConnectComponent implements OnInit {

  oauthClientIds = {
    'gitlab.lrz.de': '...',
    'keycloak.example.com/auth/realms/master': 'emu-webapp2',
  };

  connectionData: {
    url: string,
    database: string,
    serverType: 'Plain HTTP' | 'GitLab' | 'EMU-webApp-WebSocket' | 'EMU-SDMS REST',
    accessToken: string,
  } = {
    url: '',
    database: '',
    serverType: 'Plain HTTP',
    accessToken: '',
  };

  serverTypeChangedManually = false;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              public config_provider_service: ConfigProviderService,
              private view_state_service: ViewStateService) { }

  ngOnInit(){
    this.connectionData.url = this.config_provider_service.vals.main.serverUrl;
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
    // this.view_state_service.setEditing(true);
    this.view_state_service.setcursorInTextField(true);
  }

  /**
   *
   */
  public cursorOutOfTextField = function () {
    // this.view_state_service.setEditing(false);
    this.view_state_service.setcursorInTextField(false);
  }

  public urlChange () {
    if (!this.serverTypeChangedManually) {
        if (this.connectionData.url.toLowerCase().indexOf('gitlab') !== -1) {
          this.connectionData.serverType = 'GitLab';
        }
    }
  }

  public serverTypeChange(event) {
    this.serverTypeChangedManually = true;
  }

  private async getOpenIdAuthorizeUrl() {
    if (this.connectionData.serverType === 'GitLab') {
      return 'https://' + this.connectionData.url + '/oauth/authorize';
    } else {
      const url = 'https://' + this.connectionData.url + '/.well-known/openid-configuration';
        const openIdConfiguration = await (await fetch(url.toString())).json();
        return openIdConfiguration.authorization_endpoint;
    }
  }

  public async loginViaOpenIdConnect() {
    const url = new URL(await this.getOpenIdAuthorizeUrl());
    if (this.connectionData.serverType === 'GitLab') {
        url.searchParams.append('response_type', 'token');
        url.searchParams.append('scope', 'openid api');
    } else {
        url.searchParams.append('response_type', 'id_token token');
        url.searchParams.append('scope', 'openid');
    }
    url.searchParams.append('client_id', this.oauthClientIds[this.connectionData.url]);
    url.searchParams.append('redirect_uri', window.location.href);
    url.searchParams.append('state', 'a-nonce'); // @todo CRYPTOGRAPHICALLY NECESSARY GENERATE A RANDOM STATE HERE
    window.addEventListener('message', (event) => {
      if (event.data.messageType === 'openIdConnectHash') {
          console.log('openid data received', event.data.hash);
          const dataWithoutLeadingHash = event.data.hash.substring(1);
          const parsedData = new URLSearchParams(dataWithoutLeadingHash);
          if (parsedData.get('state') !== 'a-nonce') {
            // @todo DO DO DO compare this state to the one we randomly created before. if they dont match, this is a CSRF.
          }
          this.connectionData.accessToken = parsedData.get('access_token');
      }
    });
    window.open(url.toString());
  }
}
