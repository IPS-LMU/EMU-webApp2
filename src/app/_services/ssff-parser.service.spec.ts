import { TestBed, inject } from '@angular/core/testing';

import { SsffParserService } from './ssff-parser.service';

describe('SsffParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsffParserService]
    });
  });

  it('should be created', inject([SsffParserService], (service: SsffParserService) => {
    expect(service).toBeTruthy();
  }));
});
