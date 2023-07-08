import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAttributesComponent } from './general-attributes.component';

describe('GeneralAttributesComponent', () => {
  let component: GeneralAttributesComponent;
  let fixture: ComponentFixture<GeneralAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralAttributesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
