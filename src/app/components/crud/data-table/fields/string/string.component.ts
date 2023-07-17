import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

@Component({
  selector: 'eq-string',
  templateUrl: './string.component.html',
  styleUrls: ['./string.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutocompleteComponent
  ]
})
export class StringComponent implements OnDestroy {

  @Input() value!: string;
  @Input() isRestricted: boolean = false;
  @Input() restriction!: Partial<ICellRestriction>;
  @Input() isDisabled: boolean = false;
  @Input() dataRestrictions!: Partial<ICellRestriction>[];
  @Output() valueChange = new EventEmitter<string>();
  @Output() onListChange = new EventEmitter<any>();


  constructor() {
  }

  ngOnDestroy(): void {

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
