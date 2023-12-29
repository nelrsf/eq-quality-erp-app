import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight, IconDefinition, faCogs } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DragDirective } from 'src/app/directives/drag.directive';
import { DropTargetDirective } from 'src/app/directives/drop-target.directive';
import { ICellRestriction, IColumnRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { RowsRestrictionsService } from 'src/app/services/rows-restrictions.service';
import { GalleryViewComponent } from '../../gallery-view/gallery-view.component';
import { ListViewerComponent } from '../../list-viewer/list-viewer.component';
import { ListFieldComponent } from '../form/listField/list-field.component';
import { FieldsModule } from './fields/fields.module';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { SubtableComponent } from '../../subtable/subtable.component';
import { ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
import { DnDOrderDirective } from 'src/app/directives/order.directive';
import { ColumnFooterOperation } from 'src/app/Model/interfaces/IColumnFooter';
import * as math from 'mathjs';
import { ResizableDirective } from 'src/app/directives/resizable.directive';



export interface IMapAsUrl {
  columnId: string,
  urlMapFunction: (fieldName: string, row: object) => string;
}

export interface IColumnFunctions {
  columnId: string,
  functions: IColumnFunction[]
}

export interface IColumnFunction {
  functionIcon: IconDefinition,
  functionName: string,
  columnFunction: () => void;
}

export interface IRowChecked {
  _id: string,
  checked: boolean
}

@Component({
  selector: 'eq-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    RouterModule,
    NgbModule,
    DragDirective,
    DropTargetDirective,
    DnDOrderDirective,
    FieldsModule,
    ListFieldComponent,
    GalleryViewComponent,
    ListViewerComponent,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    SubtableComponent,
    ResizableDirective
  ]
})
export class DataTableComponent implements OnInit, AfterViewInit {

  @ViewChild("tableResponsive") tableResponsive!: ElementRef;
  @ViewChild("modalContextMenu") modalContextMenu!: ElementRef;
  @ViewChild("imgViewer") imgViewer!: ElementRef;
  @ViewChild("listViewer") listViewer!: ElementRef;
  @ViewChild("tableViewer") tableViewer!: ElementRef;

  @Input('mapAsUrl') mapAsUrl: IMapAsUrl[] = [];
  @Output() rowsSelectionChange = new EventEmitter<Array<IRowChecked>>();
  @Output() columnsOrderChange = new EventEmitter<Array<IColumn>>();
  @Output() columnsWidthChange = new EventEmitter<Array<IColumn>>();
  @Output() openTableViewerEvent = new EventEmitter<ISubtableValue>();

  icons = {
    angleLeft: faAngleLeft,
    angleRight: faAngleRight,
    cogs: faCogs
  }
  data = new BehaviorSubject<Array<object>>([]);
  columnsSubject = new BehaviorSubject<Array<IColumn>>([]);
  rows: Array<any> = [];
  images: Array<string> = [];
  list: Array<string> = [];
  subtableData!: ISubtableValue;
  rowsChecked: IRowChecked[] = [];
  columnsFunctions: IColumnFunctions[] = [];
  columnsRestrictions: IColumnRestriction[] = [];
  contextMenuModal: boolean = false;
  columnsProperties!: IColumn[];
  columnsPropertiesObj!: any;
  modalDisabled: boolean = false;
  createSubtableDataFcn: (rowId: string, column: IColumn, rows: any) => ISubtableValue = (rowId: string, column: IColumn, rows: any): ISubtableValue => {
    return {
      column: column.linkedTable?.column ? column.linkedTable?.column : '',
      module: column.linkedTable?.module ? column.linkedTable?.module : '',
      table: column.linkedTable?.table ? column.linkedTable?.table : '',
      rows: [],
      rowId: rowId,
      valueHost: {
        column: column._id,
        module: column.module,
        table: column.table,
        columnsOverrideData: column.linkedTable?.columnsOverrideData ? column.linkedTable?.columnsOverrideData : []
      }
    }
  }


  constructor(private ngbModal: NgbModal, private rowsRestrictionService: RowsRestrictionsService, private router: Router) { }

  ngAfterViewInit(): void {
    this.subscribeToOnResizeTable();
  }

  ngOnInit(): void {

    this.getTableHeaders();

    this.data.subscribe((rows) => {
      this.rows = rows;
      this.columnsFunctions = [];
      this.setColumnsFunctions();
      this.getColumnRestrictions();
      this.createCheckedRowsArray();
    })
  }

  createCheckedRowsArray() {
    this.rows.forEach((r) => {
      this.rowsChecked.push({
        _id: r._id,
        checked: false
      })
    });
  }


  subscribeToOnResizeTable() {
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const width = entries[0].contentRect.width;
      const height = entries[0].contentRect.height;
      if (width < 600 || height < 600) {
        this.contextMenuModal = true;
      } else {
        this.contextMenuModal = false;
      }
    });
    resizeObserver.observe(this.tableResponsive.nativeElement);
  }

  getTableHeaders() {
    this.columnsSubject.subscribe(
      (columns: IColumn[]) => {
        this.columnsProperties = columns;
        this.columnsPropertiesObj = this.getColumnsAsOnject();
        this.onReorderColumns(false);
      }
    )
  }

  isObject(data: any): boolean {
    return typeof data === 'object';
  }

  getObjectAsString(data: any): string {
    return JSON.stringify(data).replaceAll("/", "%2F%2F");
  }

  isLinkedField(id: string): boolean {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.columnId === id;
    });
    if (mapAsUrl) {
      return true;
    }
    return false;
  }

  getLinkedText(column: IColumn, row: object): string {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.columnId === column._id;
    });
    if (!mapAsUrl) {
      return "";
    }
    return mapAsUrl.urlMapFunction(column.columnName, row);
  }

  private setColumnsFunctions() {
    this.columnsFunctions = this.columnsProperties.map(
      (col) => {
        return {
          columnId: col._id,
          functions: []
        }
      }
    )
  }

  executeColumnFunctionDropDown(columnFunction: IColumnFunction, columnDropDown: any) {
    this.hideColumnsMenu(columnDropDown)
    columnFunction.columnFunction();
  }

  executeColumnFunctionModal(columnFunction: IColumnFunction) {
    this.closeModal();
    columnFunction.columnFunction();
  }

  getFunctionsByColumnId(columnId: string): IColumnFunctions {
    const columnFunctions = this.columnsFunctions.find((colFunctions) => {
      return colFunctions.columnId === columnId;
    })
    if (!columnFunctions) {
      return ([] as unknown as IColumnFunctions)
    }
    return columnFunctions;
  }

  toggleColumnsMenu(columnsDropDown: any, modalContextMenu: any) {
    if (!this.contextMenuModal) {
      columnsDropDown?.classList?.toggle("show");
    } else {
      if (!this.ngbModal.hasOpenModals()) {
        this.ngbModal.open(modalContextMenu);
      }
    }
  }

  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  openModal(event: ColumnTypes, row: any, column: IColumn) {
    const columnId = column._id;
    this.modalDisabled = column.isRestricted;
    switch (event) {
      case ColumnTypes.image:
        this.openImageViewer(row[columnId]);
        break;
      case ColumnTypes.list:
        this.openListViewer(row[columnId]);
        break;
      case ColumnTypes.table:
        this.openTableViewer(row[columnId], row._id, column);
        break;
    }
  }

  openImageViewer(images: Array<any>) {
    if (!images) {
      images = [];
    }
    if (!Array.isArray(images)) {
      images = [];
    }
    this.images = images;
    this.ngbModal.open(this.imgViewer);
  }


  openTableViewer(subtableData: any, rowId: string, column: IColumn) {
    if (!Array.isArray(subtableData?.rows)) {
      (subtableData as ISubtableValue) = this.createSubtableDataFcn(rowId, column, subtableData);
    }
    this.subtableData = subtableData;
    this.openTableViewerEvent.emit(this.subtableData);
    //this.router.navigate(['./subtable'], { state: { data: subtableData } });
  }

  openListViewer(list: Array<any>) {
    if (!list) {
      list = [];
    }
    if (!Array.isArray(list)) {
      list = [];
    }
    this.list = list;
    this.ngbModal.open(this.listViewer);
  }

  hasColumnsFunctions(id: string): boolean {
    const columnFunctions = this.getFunctionsByColumnId(id);
    if ((columnFunctions as unknown as Array<any>).length === 0) {
      return false;
    }
    return this.getFunctionsByColumnId(id)?.functions?.length !== 0;
  }

  hideColumnsMenu(columnsDropDown: any) {
    columnsDropDown.style.transition = "opacity 0.5s linear";
    columnsDropDown.style.opacity = "0";
    setTimeout(
      () => {
        columnsDropDown?.classList?.remove("show");
        columnsDropDown.style.opacity = "1";
      }
      , 1000)
  }

  getColumnProperties(id: string): IColumn | undefined {
    if (!this.columnsProperties) {
      return
    }
    return this.columnsProperties.find((colP: any) => {
      return colP._id === id;
    })
  }

  getColumnType(header: string): string {
    const columnProperties = this.getColumnProperties(header)
    if (!columnProperties) {
      return "";
    }
    if (!columnProperties.type) {
      return "";
    }
    return columnProperties.type;
  }

  toggleAll(event: any) {
    const state = event.target.checked;
    this.rowsChecked.forEach((rc) => {
      rc.checked = state
    })
  }

  isRowChecked(_id: string): boolean | undefined {
    return this.rowsChecked.find((rc) => {
      return rc._id === _id;
    })?.checked
  }

  toggleRow(_id: string) {
    let rowCheck = this.rowsChecked.find((rc) => {
      return rc._id === _id;
    });
    if (rowCheck) {
      rowCheck.checked = !rowCheck.checked;
    }
    this.rowsSelectionChange.emit(this.rowsChecked);
  }

  setRowRestriction(data: any, rowId: string, column: IColumn) {
    if (!column) {
      return;
    }
    this.rowsRestrictionService.setRowRestriction(data, rowId, this.rows, column);
  }

  filterRows(rows: any[]) {
    return rows.filter(
      (row: any) => {
        return !Object.hasOwn(row, "__rows_restrictions__data__");
      }
    )
  }

  getCellRestriction(column: IColumn, rowId: string) {
    const restrictions = this.rows.find(
      (row: any) => {
        return Object.hasOwn(row, "__rows_restrictions__data__");
      }
    )
    if (!column) {
      return;
    }
    if (!restrictions) {
      return {
        column: column,
        rowId: rowId,
        value: "",
      };
    }
    let cellRestriction = this.rowsRestrictionService
      .findRestrictionByRowAndColumn(restrictions.data, rowId, column._id);
    if (cellRestriction) {
      return cellRestriction;
    }
    if (column.isRestricted) {
      cellRestriction = {
        column: column,
        rowId: rowId,
        value: "",
      }
      restrictions.data.push(cellRestriction);
    }
    return cellRestriction;
  }

  getColumnRestrictions() {
    this.columnsProperties.forEach(
      (column: IColumn) => {
        if (!column) {
          return;
        }
        if (column.isRestricted) {
          this.rowsRestrictionService.getColumnRestrictions(column)
            .subscribe(
              (restrictions: Array<Partial<ICellRestriction>>) => {
                const dataColumnsRestrictions: IColumnRestriction = {
                  restrictions: restrictions,
                  column: column
                }
                this.columnsRestrictions.push(dataColumnsRestrictions);
                this.rowsRestrictionService.restrictionsDataSubject.next(dataColumnsRestrictions);
              }
            );
        }
      }
    )

  }

  getRestrictionsByColumnId(id: string) {
    const colRestriction = this.columnsRestrictions.find(
      (colRestr) => {
        return colRestr.column?._id === id;
      }
    );
    return colRestriction?.restrictions;
  }

  onReorderColumns(emitChange: boolean = true) {
    this.columnsProperties = this.columnsProperties.sort(
      (a: IColumn, b: IColumn) => {
        if (a.columnOrder === undefined || b.columnOrder === undefined) {
          return -1;
        }
        return a.columnOrder - b.columnOrder
      });
    if (emitChange) {
      this.columnsOrderChange.emit(this.columnsProperties);
    }
  }

  onColumnWidthChange() {
    this.columnsWidthChange.emit(this.columnsProperties);
  }

  getColumnsAsOnject() {
    const columnsObj: any = {};
    this.columnsProperties.forEach(
      (col: IColumn) => {
        columnsObj[col._id] = col;
      }
    );
    return columnsObj;
  }

  getFooterValue(column: IColumn) {
    if (!column.hasFooter) {
      return "";
    }
    if (column.footer?.operationType === undefined) {
      return "";
    }
    if (column.type !== ColumnTypes.number) {
      return "";
    }
    let columnValues = this.rows.map(r => parseFloat(r[column._id]));
    columnValues = columnValues.filter(v => !isNaN(v));
    switch (column.footer?.operationType) {
      case ColumnFooterOperation.SUM:
        return math.sum(columnValues);
      case ColumnFooterOperation.AVG:
        return math.sum(columnValues) / columnValues.length;
      case ColumnFooterOperation.COUNT:
        return columnValues.length;
      default:
        return "";
    }
  }

  hasTableFooter() {
    return this.columnsProperties.some((col) => col.hasFooter);
  }
}
