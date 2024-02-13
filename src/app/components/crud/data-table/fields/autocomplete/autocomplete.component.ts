import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowPointer, faArrowUpRightFromSquare, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, Observable, startWith } from 'rxjs';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { FormComponent } from '../../../form/form.component';
import { TablesService } from 'src/app/pages/tables/tables.service';

@Component({
  selector: 'eq-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  standalone: true,
  imports: [
    FormComponent,
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    FontAwesomeModule,
    NgbTypeaheadModule
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
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;

  filteredData!: Array<Partial<ICellRestriction>>;
  previousRestriction: Partial<ICellRestriction> = {};
  rowViewer: any;

  icons = {
    invalid: faExclamationCircle,
    delete: faTimesCircle,
    goToForm: faArrowUpRightFromSquare

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.filteredData.filter(v => v.value.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  formatValue = (item: any) => {
    return item?.value ? item.value : '';
  }


  constructor(private modal: NgbModal, private tableService: TablesService) {
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
    if (!this.data) {
      return [];
    }
    return this.data.filter(d => {
      if (d.value === undefined || d.value === null) {
        return;
      }
      return d.value?.toLowerCase().indexOf(name.toLowerCase()) !== -1;
    })

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

  async goToForm(event: any) {
    event.preventDefault();
    const fieldRestriction = this.previousRestriction || this.restriction;
    if(!fieldRestriction){
      return;
    }
    this.tableService.getRowById(
      fieldRestriction.column?.moduleRestriction || '',
      fieldRestriction.column?.tableRestriction || '',
      fieldRestriction.rowIdRestriction || '')
      .subscribe(
        {
          next: async (row: any) => {
            const formComponentImport = await import('../../../form/form.component');
            const formComponent = formComponentImport.FormComponent;
            const modalRef = this.modal.open(formComponent, {
              backdropClass: 'backdrop-infinite-form',
              size: 'lg'
            })
            modalRef.componentInstance.module = fieldRestriction.column?.moduleRestriction;
            modalRef.componentInstance.table = fieldRestriction.column?.tableRestriction;
            modalRef.componentInstance.row = row;
            modalRef.componentInstance.padding = '2rem';
          },
          error: (error: any) => {
            console.log(error)
          }
        }
      )
  }

}
