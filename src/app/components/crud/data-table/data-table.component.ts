import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight, IconDefinition, faCogs } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DragDirective } from 'src/app/directives/drag.directive';
import { DropTargetDirective } from 'src/app/directives/drop-target.directive';

export interface IMapAsUrl {
  fieldName: string,
  urlMapFunction: (fieldName: string, row: object) => string;
}

export interface IColumnFunctions {
  columnName: string,
  functions: IColumnFunction[]
}

export interface IColumnFunction {
  functionIcon: IconDefinition,
  functionName: string,
  columnFunction: () => void;
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
    DropTargetDirective
  ]
})
export class DataTableComponent implements OnInit, AfterViewInit {

  @ViewChild("tableResponsive") tableResponsive!: ElementRef;
  @ViewChild("modalContextMenu") modalContextMenu!: ElementRef;
  @Input('mapAsUrl') mapAsUrl: IMapAsUrl[] = [];

  icons = {
    angleLeft: faAngleLeft,
    angleRight: faAngleRight,
    cogs: faCogs
  }
  data = new BehaviorSubject<Array<object>>([]);
  headersSubject = new BehaviorSubject<Array<string>>([]);
  headers: Array<string> = [];
  rows: Array<any> = [];
  columnsFunctions: IColumnFunctions[] = [];

  contextMenuModal: boolean = false;

  constructor(private ngbModal: NgbModal) { }


  ngAfterViewInit(): void {
    this.subscribeToOnResizeTable();
  }

  ngOnInit(): void {

    this.getTableHeaders();

    this.data.subscribe((rows) => {
      this.rows = rows;
      this.columnsFunctions = [];
      this.setColumnsFunctions();
    })
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
    this.headersSubject.subscribe(
      (headers) => {
        this.headers = headers;
      }
    )
  }

  isObject(data: any): boolean {
    return typeof data === 'object';
  }

  getObjectAsString(data: any): string {
    return JSON.stringify(data).replaceAll("/", "%2F%2F");
  }

  isLinkedField(fieldName: string): boolean {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.fieldName === fieldName;
    });
    if (mapAsUrl) {
      return true;
    }
    return false;
  }

  getLinkedText(fieldName: string, row: object): string {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.fieldName === fieldName;
    });
    if (!mapAsUrl) {
      return "";
    }
    return mapAsUrl.urlMapFunction(fieldName, row);
  }

  private setColumnsFunctions() {
    this.headers.forEach(h => {
      this.columnsFunctions.push({
        columnName: h,
        functions: []
      })
    })
  }

  executeColumnFunctionDropDown(columnFunction: IColumnFunction, columnDropDown: any) {
    this.hideColumnsMenu(columnDropDown)
    columnFunction.columnFunction();
  }

  executeColumnFunctionModal(columnFunction: IColumnFunction) {
    this.closeModal();
    columnFunction.columnFunction();
  }

  getFunctionsByColumnName(columnName: string): IColumnFunctions {
    const columnFunctions = this.columnsFunctions.find((colFunctions) => {
      return colFunctions.columnName === columnName;
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

  hasColumnsFunctions(header: string): boolean {
    const columnFunctions = this.getFunctionsByColumnName(header);
    if ((columnFunctions as unknown as Array<any>).length === 0) {
      return false;
    }
    return this.getFunctionsByColumnName(header)?.functions?.length !== 0;
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

}
