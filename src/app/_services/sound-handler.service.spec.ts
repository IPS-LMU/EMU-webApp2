import { TestBed, inject } from '@angular/core/testing';

import { SoundHandlerService } from './sound-handler.service';

describe('SoundHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SoundHandlerService]
    });
  });

  it('should be created', inject([SoundHandlerService], (service: SoundHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
