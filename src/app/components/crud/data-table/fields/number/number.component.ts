import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { IFormula } from 'src/app/Model/interfaces/IFormula';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { IValueFurmulaChange, NumberFieldService } from './number-field.service';
import { filter } from 'rxjs';
import { compile } from 'mathjs';
import * as math from 'mathjs';

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
export class NumberComponent implements OnInit, AfterViewInit {

  @Input() value!: string;
  @Input() isRestricted: boolean = false;
  @Input() restriction!: Partial<ICellRestriction>;
  @Input() isDisabled: boolean = false;
  @Input() dataRestrictions!: Partial<ICellRestriction>[];
  @Input() columnData!: IColumn;
  @Input() rowId!: string;
  @Output() valueChange = new EventEmitter<number>();
  @Output() onListChange = new EventEmitter<any>();
  @ViewChild('fieldEditable') fieldEditable!: ElementRef;

  valueFormula!: number;
  variables!: string[];
  scope: any = {};
  editMode: boolean = false;

  constructor(private numberService: NumberFieldService) { }

  ngAfterViewInit(): void {
    setTimeout(
      () => {
        this.numberService.onChange.next(
          {
            columnId: this.columnData._id,
            rowId: this.rowId,
            value: parseFloat(this.value)
          }
        )
      }
    )
  }

  ngOnInit(): void {
    this.initializeFormula();
    this.valueChange.subscribe(
      (value: number) => {
        this.numberService.onChange.next({
          columnId: this.columnData._id,
          rowId: this.rowId,
          value: value
        })
      }
    );
  }

  onChange(event: any) {
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

  initializeFormula() {
    if (!this.columnData.hasFormula) {
      return;
    }
    if (!this.columnData.formula) {
      return;
    }
    this.variables = this.columnData?.formula.variables
      .map(v => v.replaceAll('col_', ''))
      .map(v => v.replaceAll('_', '-'));
    this.subscribeToValueChanges();
  }

  subscribeToValueChanges() {
    this.numberService.onChange
      .pipe(filter(d => this.variables.includes(d.columnId) && this.rowId === d.rowId))
      .subscribe(
        (data: IValueFurmulaChange) => {
          this.updateScope(data);
          if (this.isCompleteScope()) {
            this.updateValue(data);
          }
        }
      )
  }

  formattVariable(variable: string) {
    return 'col_' + variable.replaceAll('-', '_');
  }

  updateScope(data: IValueFurmulaChange) {
    const variableFormatted = this.formattVariable(data.columnId);
    Object.assign(this.scope, { [variableFormatted]: data.value });
  }

  isCompleteScope() {
    return this.variables.every(
      (variable: string) => {
        const variableFormatted = this.formattVariable(variable);
        return this.scope[variableFormatted] !== undefined && this.scope[variableFormatted] !== null;
      }
    )
  }

  updateValue(data: IValueFurmulaChange) {
    if (!this.columnData.formula?.expression) {
      return
    }
    const parsed = math.parse(this.columnData.formula?.expression);
    this.valueFormula = parsed.evaluate(this.scope);
    this.valueChange.emit(this.valueFormula);
  }

  onClickField(event: any) {
    this.editMode = true;
    setTimeout(
      () => {
        if (this.fieldEditable) {
          this.fieldEditable.nativeElement.focus();
        }
      })
  }

}
