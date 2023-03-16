import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnCustomizerComponent } from './column-customizer.component';

describe('ColumnCustomizerComponent', () => {
  let component: ColumnCustomizerComponent;
  let fixture: ComponentFixture<ColumnCustomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnCustomizerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
