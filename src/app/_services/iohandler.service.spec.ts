import { TestBed, inject } from '@angular/core/testing';

import { IohandlerService } from './iohandler.service';

describe('IohandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IohandlerService]
    });
  });

  it('should be created', inject([IohandlerService], (service: IohandlerService) => {
    expect(service).toBeTruthy();
  }));
});
