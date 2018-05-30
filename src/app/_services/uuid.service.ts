import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UuidService {

  constructor() { }

  private rand(s) {
    let p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
  }

  //
  public new() {
    return this.rand(false) + this.rand(true) + this.rand(true) + this.rand(false);
  };

  public newHash() {
    return this.rand(false) + this.rand(true) + this.rand(true) + this.rand(false);
  };

  //
  empty() {
    return '00000000-0000-0000-0000-000000000000';
  };

}
