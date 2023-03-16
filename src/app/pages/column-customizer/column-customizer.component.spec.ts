import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnCustomizerPageComponent } from './column-customizer.component';


describe('ColumnCustomizerComponent', () => {
  let component: ColumnCustomizerPageComponent;
  let fixture: ComponentFixture<ColumnCustomizerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnCustomizerPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnCustomizerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
