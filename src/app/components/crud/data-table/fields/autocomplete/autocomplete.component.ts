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
import { AutocompleteFilterService } from 'src/app/services/autocomplete-filter.service';
import { AutocompleteValidationService } from 'src/app/services/autocomplete-validation.service';
import { AutocompleteFormNavigationService } from 'src/app/services/autocomplete-form-navigation.service';
import { AutocompleteStateService } from 'src/app/services/autocomplete-state.service';

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
  @Input() editable: boolean = true;
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
    this.filterService.createSearch(this.filteredData)(text$);

  formatValue = (item: any) => {
    return item?.value ? item.value : '';
  }


  constructor(
    private modal: NgbModal, 
    private tableService: TablesService,
    private filterService: AutocompleteFilterService,
    private validationService: AutocompleteValidationService,
    private formNavigationService: AutocompleteFormNavigationService,
    private stateService: AutocompleteStateService
  ) {
  }

  ngAfterViewInit(): void {
    const inputChangeEvent = fromEvent(this.autocompleteInput.nativeElement, "input");
    inputChangeEvent.subscribe(
      (event: any) => {
        const value: string = event.target.value;
        this.filteredData = this.filterService.filterData(this.data, value);
      }
    )
  }


  ngOnInit(): void {
    this.previousRestriction = this.restriction;
  }

  filterData = (name: string) => {
    return this.filterService.filterData(this.data, name);
  }

  onFocus(event: any) {
    const value = event.target.value;
    this.filteredData = this.filterService.filterData(this.data, value);
  }

  checkValue() {
    if (this.validationService.doesValueMatchRestrictions(this.data, this.value)) {
      if (this.value === "") {
        const deleteRestriction = this.stateService.createDeleteModeRestriction(this.previousRestriction);
        this.previousRestriction = deleteRestriction;
        this.onListChange.emit(deleteRestriction);
        return;
      }
      const dataRestriction = this.validationService.findMatchingRestriction(this.data, this.value);
      if (!dataRestriction) {
        return;
      }
      const normalRestriction = this.stateService.createNormalModeRestriction(dataRestriction);
      this.previousRestriction = this.stateService.updatePreviousRestriction(this.previousRestriction, normalRestriction);
      this.onListChange.emit(normalRestriction);
    }
  }

  didValueMatchRestrictions(): boolean {
    return this.validationService.doesValueMatchRestrictions(this.data, this.value);
  }

  async goToForm(event: any) {
    event.preventDefault();
    const fieldRestriction = this.previousRestriction || this.restriction;
    await this.formNavigationService.openForm(fieldRestriction);
  }

}
