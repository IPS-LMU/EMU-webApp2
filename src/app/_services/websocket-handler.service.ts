import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { UuidService } from './uuid.service';
import { ConfigProviderService } from './config-provider.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketHandlerService {

  constructor(private uuid: UuidService,
              private cps: ConfigProviderService) { }

  // Keep all pending requests here until they get responses
  private callbacks = {};
  //
  // Create our websocket object with the address to the websocket
  private ws;
  subject: Subject<any>;
  //
  // // empty promise object to be resolved when connection is up
  // var conPromise = {};
  //
  connected = false;


  ////////////////////////////
  // ws function

  private listener(data) {
    let messageObj = data;
    // console.log('Received data from websocket: ', messageObj);
    // If an object exists with callbackID in our callbacks object, resolve it
    if (this.callbacks.hasOwnProperty(messageObj.callbackID)) {
      // console.log(this.callbacks[messageObj.callbackID]);
      // console.log('resolving callback: ' + messageObj.type + ' Nr.: ' + messageObj.callbackID);
      switch (messageObj.type) {
        case 'getESPSfile':
          alert('espsfile');
          //handleReceivedESPS(messageObj.fileName, messageObj.data);
          break;
        case 'getSSFFfile':
          alert('ssfffile');
          //handleReceivedSSFF(messageObj.fileName, messageObj.data);
          break;
      }

      // resolve promise with data only
      if (messageObj.status.type === 'SUCCESS') {
        this.callbacks[messageObj.callbackID].cb.next(messageObj.data);

      } else {
        // show protocol error and disconnect from server
        this.closeConnect();
  //       $rootScope.$broadcast('resetToInitState');
  //       $rootScope.$apply(modalService.open('views/error.html', 'Communication error with server! Error message is: ' + messageObj.status.message));
      }

      // delete callbacks[messageObj.callbackID];
    } else {
      if(typeof messageObj.status === 'undefined'){
  //       modalService.open('views/error.html', 'Just got JSON message from server that the EMU-webApp does not know how to deal with! This is not allowed!');
      }
      else if (messageObj.status.type === 'ERROR:TIMEOUT') {
        // do nothing
      } else {
        // modalService.open('views/error.html', 'Received invalid messageObj.callbackID that could not be resolved to a request! This should not happen and indicates a bad server response! The invalid callbackID was: ' + messageObj.callbackID);
      }

    }
  }


  // This creates a new callback ID for a request
  private getCallbackId() {
    let newUUID = this.uuid.new();
    return newUUID;
  }

  // broadcast on open
  private wsonopen(message: MessageEvent): void {
    // console.log('in wsonopen', this);
    this.connected = true;
    this.subject.next(message);
    // $rootScope.$apply(conPromise.resolve(message));
  }

  wsonmessage(message) {
    // console.log('in wsh wsonmessage');
    try{
      let jsonMessage = JSON.parse(message.data);
      this.listener(jsonMessage);
    }catch(e){
      // console.error(e);
      // modalService.open('views/error.html', 'Got non-JSON string as message from server! This is not allowed! The message was: ' + message.data + ' which caused the angular.fromJson error: ' + e).then(function () {
      //   sServObj.closeConnect();
      //   $rootScope.$broadcast('resetToInitState');
      // });
    }
  }

  wsonerror(message) {
    // console.error('WEBSOCKET ERROR!!!!!');
    // $rootScope.$apply(conPromise.resolve(message));
  }

  wsonclose(message) {
    // if (!message.wasClean && connected) {
    //   modalService.open('views/error.html', 'A non clean disconnect to the server occurred! This probably means that the server is down. Please check the server and reconnect!').then(function () {
    //     $rootScope.$broadcast('connectionDisrupted');
    //   });
    // }
    this.connected = false;
    // console.log('WEBSOCKET closed!!!!!');
  }

  private sendRequest(request) {
    // console.log('in wsh sendRequest');
    // var defer = $q.defer();
    let sbj = new Subject();
    let callbackId = this.getCallbackId();
    this.callbacks[callbackId] = {
      time: new Date(),
      cb: sbj
    };
    request.callbackID = callbackId;
    this.ws.send(JSON.stringify(request));
    // timeout request if not answered
    setTimeout(() =>  {
      let tOutResp = {
        'callbackID': callbackId,
        'status': {
          'type': 'ERROR:TIMEOUT',
          'message': 'Sent request of type: ' + request.type +
          ' timed out after ' + this.cps.vals.main.serverTimeoutInterval + 'ms!  Please check the server...'
        }
      };
      this.listener(tOutResp);
    }, this.cps.vals.main.serverTimeoutInterval);

    return sbj;
  }



  ///////////////////////////////////////////
  // public api
  initConnect(url) {
    // console.log(url);
    this.subject = new Subject();

    try{
      this.ws = new WebSocket(url);
      this.ws.onopen = this.wsonopen.bind(this);
      this.ws.onmessage = this.wsonmessage.bind(this);
      this.ws.onerror = this.wsonerror.bind(this);
      this.ws.onclose = this.wsonclose.bind(this);
    }catch (err){
      // console.log('askldfjöaskdjfklafjökdas');
      // return $q.reject('A malformed websocket URL that does not start with ws:// or wss:// was provided.');
    }
    // this.ws = WebSocketSubject.create(url)
    // this.conObs = Subject.create();

    return this.subject;
  }

  // public connect(url): Subject<MessageEvent> {
  //   if (!this.subject) {
  //     this.subject = this.create(url);
  //     console.log('Successfully connected: ' + url);
  //   }
  //   console.log(this.subject);
  //   let subject = new Subject();
  //
  //   subject.subscribe({
  //     next: (v) => console.log('observerA: ' + v)
  //   });
  //   subject.subscribe({
  //     next: (v) => console.log('observerB: ' + v)
  //   });
  //
  //   subject.next(1);
  //   subject.next(2);
  //   return this.subject;
  // }

  // private create(url): Subject<MessageEvent> {
  //   let ws = new WebSocket(url);
  //   let observable = Observable.create(
  //     (obs: Observer<MessageEvent>) => { // subscribe function
  //       ws.onmessage = obs.next.bind(obs);
  //       ws.onerror = obs.error.bind(obs);
  //       ws.onclose = obs.complete.bind(obs);
  //       return ws.close.bind(ws);
  //     });
  //   let observer = {
  //     next: (data: Object) => {
  //       console.log('???');
  //       if (ws.readyState === WebSocket.OPEN) {
  //         ws.send(JSON.stringify(data));
  //       }
  //     }
  //   };
  //   return Subject.create(observer, observable);
  //
  // }


  public isConnected() {
    return this.connected;
  }

  // close connection with ws
  public closeConnect() {
    if (this.isConnected()) {
      this.ws.onclose = function () {};
      this.ws.close();
    }
    else {
      // console.log('WEBSOCKET ERROR: was not connected!');
    }
  }

  ////////////////////////////
  // EMU-webApp protocol begins here
  //

  // ws getProtocol
  getProtocol() {
    let request = {
      type: 'GETPROTOCOL'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }

  // ws getDoUserManagement
  getDoUserManagement() {
    let request = {
      type: 'GETDOUSERMANAGEMENT'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }

  // ws logOnUser
  logOnUser = function (name, pwd) {
    let request = {
      type: 'LOGONUSER',
      userName: name,
      pwd: pwd
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }

  // ws getConfigFile
  getDBconfigFile() {
    let request = {
      type: 'GETGLOBALDBCONFIG'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }

  // ws getBundleList
  getBundleList() {
    let request = {
      type: 'GETBUNDLELIST'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  };

  // ws  getBundle
  getBundle(name, session) {

    let request = {
      type: 'GETBUNDLE',
      name: name,
      session: session
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  };

  // ws  saveBundle
  saveBundle(bundleData) {

    let request = {
      type: 'SAVEBUNDLE',
      data: bundleData
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }

  // ws  saveConfiguration
  saveConfiguration(configData) {

    let request = {
      type: 'SAVEDBCONFIG',
      data: configData
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }


  // ws  disconnecting
  disconnectWarning() {
    let request = {
      type: 'DISCONNECTWARNING'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }


  // ws  GetDoEditDBConfig
  getDoEditDBConfig(){
    let request = {
      type: 'GETDOEDITDBCONFIG'
    };
    // Storing in a variable for clarity on what sendRequest returns
    let subj = this.sendRequest(request);
    return subj;
  }


  // ws  editDBConfig with subtype and data
  editDBConfig(subtype, data) {
    let request = {
      type: 'EDITDBCONFIG',
      subtype: subtype,
      data: data
    };
    // Storing in a variable for clarity on what sendRequest returns
    var subj = this.sendRequest(request);
    return subj;
  };

  //
  // EMU-webApp protocol ends here
  ////////////////////////////

}
