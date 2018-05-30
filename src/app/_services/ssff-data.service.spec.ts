import { TestBed, inject } from '@angular/core/testing';

import { SsffDataService } from './ssff-data.service';

describe('SsffDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsffDataService]
    });
  });

  it('should be created', inject([SsffDataService], (service: SsffDataService) => {
    expect(service).toBeTruthy();
  }));
});
