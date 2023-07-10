import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePermissionsComponent } from './table-permissions.component';

describe('PermissionsComponent', () => {
  let component: TablePermissionsComponent;
  let fixture: ComponentFixture<TablePermissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablePermissionsComponent]
    });
    fixture = TestBed.createComponent(TablePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
