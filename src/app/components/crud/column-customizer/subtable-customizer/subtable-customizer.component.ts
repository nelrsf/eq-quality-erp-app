import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ColumnSelector } from '../columnSelector/column-selector.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { faCalculator, faCogs, faEllipsis, faEllipsisVertical, faEye, faEyeSlash, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IColumnsOverrideData } from 'src/app/Model/interfaces/ISubtableValue';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DnDOrderDirective } from 'src/app/directives/order.directive';
import { DragDirective } from 'src/app/directives/drag.directive';
import { DropTargetDirective } from 'src/app/directives/drop-target.directive';
import { generateObjectId } from 'src/app/functions/generateObjectId';
import { GeneralAttributesComponent } from '../general-attributes/general-attributes.component';
import { NgbDropdownModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnFormulaComponent } from '../column-formula/column-formula.component';

@Component({
  selector: 'eq-subtable-customizer',
  templateUrl: './subtable-customizer.component.html',
  styleUrls: ['./subtable-customizer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ColumnSelector,
    FontAwesomeModule,
    DnDOrderDirective,
    DragDirective,
    DropTargetDirective,
    GeneralAttributesComponent,
    ColumnFormulaComponent,
    NgbDropdownModule
  ]
})
export class SubtableCustomizerComponent implements OnInit {

  @Input() columnData!: IColumn;
  @Output() columnOperationEnd = new EventEmitter<void>();
  @ViewChild('customizerColumn') customizerColumn!: ElementRef;
  @ViewChild('customizerFormula') customizerFormula!: ElementRef;

  module!: IModule;
  table!: ITable;
  column!: IColumn;
  columnsArray!: IColumn[];
  overrideColumns!: IColumnsOverrideData[];
  jsonColumns: any;
  currentColumn!: IColumn;
  customizerModalInstance!: NgbModalRef;
  COLUMN_TYPES = ColumnTypes;
  // allowedTypesForFormula: Array<ColumnTypes> = [ColumnTypes.table, ColumnTypes.number]

  loading: boolean = false;
  icons = {
    show: faEye,
    hide: faEyeSlash,
    add: faPlus,
    delete: faTrash,
    edit: faCogs,
    menu: faEllipsisVertical,
    calculator: faCalculator
  }

  constructor(private ngbModal: NgbModal) { }

  ngOnInit(): void {
    this.jsonColumns = this.convertArrayColumnsToJson(this.overrideColumns);
  }


  submitSubtableData() {
    this.columnData.linkedTable = {
      column: this.column?._id ? this.column._id : '',
      module: this.module?.name ? this.module.name : '',
      table: this.table?.name ? this.table.name : '',
      columnsOverrideData: this.overrideColumns
    }

    this.columnOperationEnd.emit();
  }

  getTablesFilterCallback(table: ITable, columnData?: IColumn) {
    return table.name !== columnData?.table && !table.isFolder;
  }

  onColumnsChange(columns: IColumn[]) {
    const overrideColumns: IColumnsOverrideData[] = columns
      .map(
        (column: IColumn, index: number): IColumnsOverrideData => {
          return {
            columnId: column._id,
            hide: false,
            isVirtualColumn: false,
            order: index,
            virtualColumnData: column
          }
        }
      );
    const aditionalColumns: IColumnsOverrideData[] = this.columnData.linkedTable?.columnsOverrideData ? this.columnData.linkedTable?.columnsOverrideData.filter(c => c.isVirtualColumn) : [];
    this.overrideColumns = ([] as IColumnsOverrideData[]).concat(aditionalColumns, overrideColumns);
    this.overrideColumnsVisivility(this.columnData.linkedTable?.columnsOverrideData);
    this.overrideColumnsOrder(this.columnData.linkedTable?.columnsOverrideData);
    this.overrideColumns.sort((a: IColumnsOverrideData, b: IColumnsOverrideData) => {
      if(a?.order === undefined || b?.order === undefined){
        return -1
      }
      return a.order - b.order
    })
    this.jsonColumns = this.convertArrayColumnsToJson(this.overrideColumns);
  }

  overrideColumnsVisivility(overrideColumns: IColumnsOverrideData[] | undefined) {
    if (!overrideColumns) {
      return;
    }
    this.overrideColumns.forEach(
      (oc: IColumnsOverrideData) => {
        const hidden = overrideColumns.find(item => item.columnId === oc.columnId)?.hide === true;
        oc.hide = hidden;
      }
    )
  }

  overrideColumnsOrder(overrideColumns: IColumnsOverrideData[] | undefined) {
    if (!overrideColumns) {
      return;
    }
    this.overrideColumns.forEach(
      (oc: IColumnsOverrideData) => {
        const order = overrideColumns.find(item => item.columnId === oc.columnId)?.order;
        oc.order = order;
      }
    )
  }

  convertArrayColumnsToJson(array: Array<IColumnsOverrideData>) {
    const jsonColumns: any = {};
    array?.forEach(
      (col: IColumnsOverrideData) => {
        jsonColumns[col.columnId] = col;
      }
    );
    return jsonColumns;
  }

  addVirtualColumn() {
    const columnId = generateObjectId();
    const virtualColumn: IColumnsOverrideData = {
      columnId: columnId,
      hide: false,
      order: 0,
      isVirtualColumn: true,
      virtualColumnData: this.createColumn(columnId)
    };
    this.overrideColumns.unshift(virtualColumn)
  }

  createColumn(id: string): IColumn {
    return {
      _id: id,
      columnName: 'Nueva Columna',
      hidden: false,
      isRestricted: false,
      module: '',
      table: '',
      required: false,
      type: ColumnTypes.string,
      unique: false,
      width: 100,
      permissions: {
        delete: [],
        edit: [],
        read: []
      }
    }
  }

  openEditModal(overrideColumn: IColumnsOverrideData) {
    this.currentColumn = overrideColumn.virtualColumnData;
    this.customizerModalInstance = this.ngbModal.open(this.customizerColumn);
  }

  onEditColumnEnd() {
    this.customizerModalInstance.close();
  }

  deleteColumn(id: string) {
    const columnIndex = this.overrideColumns.findIndex(
      (col: IColumnsOverrideData) => {
        return col.columnId === id;
      }
    );
    if (columnIndex < 0) {
      return;
    }
    this.overrideColumns.splice(columnIndex, 1);
  }

  openEditFormulaModal(overrideColumn: IColumnsOverrideData) {
    this.currentColumn = overrideColumn.virtualColumnData;
    this.columnsArray = this.overrideColumns.map(oc => oc.virtualColumnData);
    this.customizerModalInstance = this.ngbModal.open(this.customizerFormula);
  }
}
