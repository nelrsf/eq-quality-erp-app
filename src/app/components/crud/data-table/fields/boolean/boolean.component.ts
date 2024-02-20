import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'eq-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class BooleanComponent {
  @Input() isRestricted!: boolean;
  @Input() value!: boolean;
  @Input() editable: boolean = true;
  @Output() valueChange = new EventEmitter<boolean>();

  onChange(event: any){
    this.valueChange.emit(event.target.checked);
  }
}
