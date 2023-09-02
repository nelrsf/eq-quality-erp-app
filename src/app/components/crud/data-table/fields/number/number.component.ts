import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { IValueFurmulaChange, NumberFieldService } from './number-field.service';
import { filter, forkJoin } from 'rxjs';
import * as math from 'mathjs';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { findColumnById } from 'src/app/functions/findColumnById';
import { ColumnFooterOperation } from 'src/app/Model/interfaces/IColumnFooter';
import { ColumnNumber } from 'src/app/components/miscelaneous/formula-editor/formula-elements/column-number';
import { ColumnSubtable } from 'src/app/components/miscelaneous/formula-editor/formula-elements/column-subtable';

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

  constructor(private numberService: NumberFieldService, private tableService: TablesService) { }

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
    const subtableVariables = this.columnData?.formula.variables.filter(v => v.startsWith('subtable_'));
    this.getSubtablesScope(subtableVariables);
    this.variables = this.columnData?.formula.variables
      .map(v => v.replaceAll('col_', ''))
      .map(v => v.replaceAll('subtable_', ''))
      .map(v => v.replaceAll('_', '-'));

    this.subscribeToValueChanges();
  }

  getSubtablesScope(variables: Array<string>) {
    variables.forEach(
      (variable: string) => {
        const formattedVar = variable.replaceAll('subtable_', '').replaceAll('_', '-');
        const subIds = formattedVar.split('subtableDiv');
        if (subIds.length !== 2) {
          return;
        }
        const subtableleId = subIds[0];
        const colId = subIds[1];
        const getRowIdObs = this.tableService.getRowById(this.columnData.module, this.columnData.table, this.rowId, subtableleId);
        const getColumnObs = this.tableService.getColumnData(this.columnData.module, this.columnData.table, subtableleId);
        forkJoin([getRowIdObs, getColumnObs])
          .subscribe(
            {
              next: (result: any) => {
                const rowsData: Array<any> = result[0];
                const subtableColumn: IColumn = result[1];
                const subColumns = subtableColumn.linkedTable?.columnsOverrideData.map(ov => ov.virtualColumnData);
                if (!subColumns) {
                  return;
                }
                const subColumnFormula = findColumnById(colId, subColumns);
                if (!subColumnFormula) {
                  return;
                }
                const operation = subColumnFormula.footer?.operationType;
                if (!operation) {
                  return;
                }
                const values = rowsData.map(v => v[colId]).filter(v => typeof v === 'number');
                let subtableColumnFormula = new ColumnSubtable(this.columnData);
                let scopeVar: IValueFurmulaChange = {
                  columnId: colId,
                  subtableId: subtableleId,
                  rowId: this.rowId,
                  value: 0
                }
                switch (operation) {
                  case ColumnFooterOperation.SUM:
                    scopeVar.value = math.sum(values);
                    subtableColumnFormula.updateScope(scopeVar, this.scope);
                    break;
                  case ColumnFooterOperation.AVG:
                    scopeVar.value = math.sum(values) / values.length;
                    subtableColumnFormula.updateScope(scopeVar, this.scope);
                    break;
                  case ColumnFooterOperation.COUNT:
                    scopeVar.value = values.length;
                    subtableColumnFormula.updateScope(scopeVar, this.scope);
                    break;
                }
                if (this.isCompleteScope()) {
                  this.updateValue();
                }
              },
              error: (error: any) => {
                console.log(error);
              }
            }
          )
      }
    )
  }

  subscribeToValueChanges() {
    this.numberService.onChange
      .pipe(filter(d => this.variables.includes(d.columnId) && this.rowId === d.rowId))
      .subscribe(
        (data: IValueFurmulaChange) => {
          const columnNumberFormula = new ColumnNumber(this.columnData);
          columnNumberFormula.updateScope(data, this.scope);
          if (this.isCompleteScope()) {
            this.updateValue();
          }
        }
      )
  }



  isCompleteScope() {
    return this.variables.every(
      (variable: string) => {
        const subIds = variable.split('subtableDiv');
        let variableFormatted: string;
        if (subIds.length === 2) {
          const columnSubtableFormula = new ColumnSubtable(this.columnData);
          variableFormatted = columnSubtableFormula.formattVariable(variable);
        } else {
          const columnNumberFormula = new ColumnNumber(this.columnData);
          variableFormatted = columnNumberFormula.formattVariable(variable);
        }

        return this.scope[variableFormatted] !== undefined && this.scope[variableFormatted] !== null;
      }
    )
  }

  updateValue() {
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
