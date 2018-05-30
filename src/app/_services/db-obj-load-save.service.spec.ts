import { TestBed, inject } from '@angular/core/testing';

import { DbObjLoadSaveService } from './db-obj-load-save.service';

describe('DbObjLoadSaveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbObjLoadSaveService]
    });
  });

  it('should be created', inject([DbObjLoadSaveService], (service: DbObjLoadSaveService) => {
    expect(service).toBeTruthy();
  }));
});
