import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'eq-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class NumberComponent {

  @Input() value!: string;
  @Output() valueChange = new EventEmitter<string>();

  onChange(event: any){
    this.valueChange.emit(event.target.value)
  }

}
