import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { showIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';


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

interface IRowChecked {
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
    FieldsModule,
    ListFieldComponent,
    GalleryViewComponent,
    ListViewerComponent,
    ShowIfIsAdmin,
    showIfIsOwner
  ]
})
export class DataTableComponent implements OnInit, AfterViewInit {

  @ViewChild("tableResponsive") tableResponsive!: ElementRef;
  @ViewChild("modalContextMenu") modalContextMenu!: ElementRef;
  @ViewChild("imgViewer") imgViewer!: ElementRef;
  @ViewChild("listViewer") listViewer!: ElementRef;

  @Input('mapAsUrl') mapAsUrl: IMapAsUrl[] = [];

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
  rowsChecked: IRowChecked[] = [];
  columnsFunctions: IColumnFunctions[] = [];
  columnsRestrictions: IColumnRestriction[] = [];
  contextMenuModal: boolean = false;
  columnsProperties!: IColumn[];

  constructor(private ngbModal: NgbModal, private rowsRestrictionService: RowsRestrictionsService) { }

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

  openModal(event: ColumnTypes, data: any) {
    switch (event) {
      case ColumnTypes.image:
        this.openImageViewer(data);
        break;
      case ColumnTypes.list:
        this.openListViewer(data);
        break;
    }
  }

  openImageViewer(images: Array<any>) {
    this.images = images;
    this.ngbModal.open(this.imgViewer);
  }

  openListViewer(list: Array<any>) {
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
}
