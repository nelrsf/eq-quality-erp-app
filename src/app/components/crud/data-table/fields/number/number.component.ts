import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

@Component({
  selector: 'eq-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AutocompleteComponent
  ]
})
export class NumberComponent {

  @Input() value!: string;
  @Input() isRestricted: boolean = false;
  @Input() restriction!: Partial<ICellRestriction>;
  @Input() isDisabled: boolean = false;
  @Input() dataRestrictions!: Partial<ICellRestriction>[];
  @Output() valueChange = new EventEmitter<number>();
  @Output() onListChange = new EventEmitter<any>();

  onChange(event: any){
    this.valueChange.emit(event.target.value)
  }

  onChangeByRestricted(value: any) {
    this.valueChange.emit(value);
  }

  onChangeByText(event: any) {
    this.valueChange.emit(event.target.value);
  }

  listChange(data: Partial<ICellRestriction>) {
    this.onListChange.emit(data);
  }
}
