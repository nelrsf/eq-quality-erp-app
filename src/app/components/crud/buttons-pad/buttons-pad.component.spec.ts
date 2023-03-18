import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonsPadComponent } from './buttons-pad.component';

describe('ButtonsPadComponent', () => {
  let component: ButtonsPadComponent;
  let fixture: ComponentFixture<ButtonsPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonsPadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonsPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
