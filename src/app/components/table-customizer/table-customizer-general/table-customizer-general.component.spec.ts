import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCustomizerGeneralComponent } from './table-customizer-general.component';

describe('TableCustomizerGeneralComponent', () => {
  let component: TableCustomizerGeneralComponent;
  let fixture: ComponentFixture<TableCustomizerGeneralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableCustomizerGeneralComponent]
    });
    fixture = TestBed.createComponent(TableCustomizerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
