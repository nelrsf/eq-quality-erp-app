import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class DateComponent {

  @Input() value!: string;
  @Output() valueChange = new EventEmitter<string>();

  onChange(event: any){
    this.valueChange.emit(event.target.value)
  }

}
