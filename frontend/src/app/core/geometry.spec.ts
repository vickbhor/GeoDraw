import { TestBed } from '@angular/core/testing';

import { Geometry } from './geometry';

describe('Geometry', () => {
  let service: Geometry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Geometry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
