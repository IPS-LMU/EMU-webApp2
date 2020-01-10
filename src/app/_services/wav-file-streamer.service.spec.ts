import { TestBed, inject } from '@angular/core/testing';

import { WavFileStreamerService } from './wav-file-streamer.service';

describe('WavFileStreamerService', () => {
  let service: WavFileStreamerService;
  beforeEach(() => { service = new WavFileStreamerService("localhost:8080", 10); });

  it('should be created', inject([WavFileStreamerService], (service: WavFileStreamerService) => {
    expect(service).toBeTruthy();
  }));
});
