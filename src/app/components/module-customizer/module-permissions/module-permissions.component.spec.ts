import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulePermissionsComponent } from './module-permissions.component';

describe('PermissionsComponent', () => {
  let component: ModulePermissionsComponent;
  let fixture: ComponentFixture<ModulePermissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModulePermissionsComponent]
    });
    fixture = TestBed.createComponent(ModulePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
