import { TestBed, inject } from '@angular/core/testing';

import { WavParserService } from './wav-parser.service';

describe('WavParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WavParserService]
    });
  });

  it('should be created', inject([WavParserService], (service: WavParserService) => {
    expect(service).toBeTruthy();
  }));
});
