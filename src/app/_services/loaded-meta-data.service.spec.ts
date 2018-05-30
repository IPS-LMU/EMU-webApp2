import { TestBed, inject } from '@angular/core/testing';

import { LoadedMetaDataService } from './loaded-meta-data.service';

describe('LoadedMetaDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadedMetaDataService]
    });
  });

  it('should be created', inject([LoadedMetaDataService], (service: LoadedMetaDataService) => {
    expect(service).toBeTruthy();
  }));
});
