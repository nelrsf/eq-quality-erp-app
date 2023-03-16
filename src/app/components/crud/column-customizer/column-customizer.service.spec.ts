import { TestBed } from '@angular/core/testing';

import { ColumnCustomizerService } from './column-customizer.service';

describe('ColumnCustomizerService', () => {
  let service: ColumnCustomizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnCustomizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
