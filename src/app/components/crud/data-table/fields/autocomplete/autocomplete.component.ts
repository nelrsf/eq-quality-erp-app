import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { filter, fromEvent, map, Observable, startWith } from 'rxjs';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';

@Component({
  selector: 'eq-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    FontAwesomeModule
  ]
})
export class AutocompleteComponent implements OnInit, AfterViewInit {

  @Input() data!: Array<Partial<ICellRestriction>>;
  @Input() value!: string;
  @Input() isDisabled!: boolean;
  @Input() restriction!: Partial<ICellRestriction>;
  @Output() valueChange = new EventEmitter<string>();
  @Output() onListChange = new EventEmitter<Partial<ICellRestriction>>();

  @ViewChild('autocompleteInput') autocompleteInput!: ElementRef;

  filteredData!: Array<Partial<ICellRestriction>>;
  previousRestriction: Partial<ICellRestriction> = {};

  icons = {
    invalid: faExclamationCircle,
    delete: faTimesCircle
  }


  constructor() {
  }

  ngAfterViewInit(): void {
    const inputChangeEvent = fromEvent(this.autocompleteInput.nativeElement, "input");
    inputChangeEvent.subscribe(
      (event: any) => {
        const value: string = event.target.value;
        this.filteredData = this.filterData(value);
      }
    )
  }


  ngOnInit(): void {
    this.previousRestriction = this.restriction;
  }

  filterData = (name: string) => {
    return this.data.filter(d =>
      d.value.toLowerCase().indexOf(name.toLowerCase()) !== -1);
  }

  onFocus(event: any) {
    const value = event.target.value;
    this.filteredData = this.filterData(value);
  }

  checkValue() {
    if (this.didValueMatchRestrictions()) {
      if (this.value === "") {
        this.previousRestriction = this.previousRestriction ? this.previousRestriction : {};
        this.previousRestriction.deleteMode = true
        this.onListChange.emit(this.previousRestriction);
        return;
      }
      const dataRestriction = this.data?.find(
        (cellRes: Partial<ICellRestriction>) => {
          return cellRes.value === this.value;
        }
      );
      if (!dataRestriction) {
        return;
      }
      this.previousRestriction = dataRestriction;
      this.previousRestriction.deleteMode = false;
      this.onListChange.emit(dataRestriction);
    }
  }

  didValueMatchRestrictions(): boolean {
    if (!this.data) {
      return true;
    }
    const findValue = this.data.find(
      (element) => {
        return element.value === this.value;
      }
    )
    return findValue !== undefined || !this.value;
  }

}
