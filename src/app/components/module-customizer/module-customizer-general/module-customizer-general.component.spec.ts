import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleCustomizerGeneralComponent } from './module-customizer-general.component';

describe('ModuleCustomizerGeneralComponent', () => {
  let component: ModuleCustomizerGeneralComponent;
  let fixture: ComponentFixture<ModuleCustomizerGeneralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModuleCustomizerGeneralComponent]
    });
    fixture = TestBed.createComponent(ModuleCustomizerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
