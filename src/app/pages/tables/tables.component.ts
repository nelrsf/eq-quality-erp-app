import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCog, faSquareCaretLeft, faSquareCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { DataTableComponent, IColumnFunctions, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { TablesService } from './tables.service';

@Component({
  selector: 'eq-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
})
export class TablesComponent implements OnInit, AfterViewInit {

  icons = {
    cog: faCog,
    columnNext: faSquareCaretRight,
    columnBefore: faSquareCaretLeft,
    columnDelete: faTrash
  }

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild("colCustomizerModal") colCustomizerModal!: ElementRef;
  @ViewChild("formModal") formModal!: ElementRef;

  loading = false;
  linkedFields: IMapAsUrl[] = [];
  columnData!: IColumn;
  table!: string;
  module!: string;
  editColumnName: boolean = true;


  constructor(private tableService: TablesService, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private router: Router, private ngbModal: NgbModal) { }

  ngAfterViewInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (this.getRowsFromServer(params)) {
        this.cdRef.detectChanges();
        return;
      }
      if (this.getDataFromServer(params)) {
        this.cdRef.detectChanges();
        return;
      }
      this.getAuxData(params);
      this.cdRef.detectChanges();
    })
  }

  getDataFromServer(params: any) {
    this.module = params['module'];
    if (this.module) {
      this.getTableData(this.module);
      return true;
    }
    return false;
  }

  getRowsFromServer(params: any): boolean {
    this.module = params['module'];
    this.table = params['table'];
    if (this.module && this.table) {
      this.getColumnsData(this.module, this.table)
      return true;
    }
    return false;
  }

  getAuxData(params: any) {
    const objectdataStr = params['objectdata'];
    if (!objectdataStr) {
      return;
    }
    let objectdata;
    try {
      objectdata = JSON.parse(objectdataStr)
    } catch (error) {
      console.log('Error parsing JSON string:');
    };

    if (objectdata) {
      const headers = Object.keys(objectdata);
      this.dataTable.headersSubject.next(headers);
      this.dataTable.data.next([objectdata]);
    }
  }


  ngOnInit(): void {
    //not implemented
  }

  setLinkedFields(module: string) {
    this.linkedFields.push(
      {
        fieldName: 'name',
        urlMapFunction: (fieldName: string, row: any) => {
          return "/tables/data/" + module + "/" + row[fieldName];
        }
      }
    )
  }

  setColumnsFunctions(module: string, table: string) {
    this.dataTable.columnsFunctions.forEach(colF => {
      colF.functions.push(
        ...this.createColumnsFunctionsArray(module, table, colF)
      )
    })
  }

  getTableData(module: string) {
    this.loading = true;
    this.tableService.getAllTables(module).subscribe(
      {
        next: (result: any) => {
          this.setLinkedFields(module);
          this.loading = false;
          if (result.length === 0) {
            return;
          }
          this.dataTable.data.next(result);
          const headersNames = Object.keys(result[0]);
          this.dataTable.headersSubject.next(headersNames);
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        }
      }
    )
  }

  getColumnsData(module: string, table: string) {
    this.tableService.getAllColumns(module, table)
      .subscribe(
        {
          next: (result: any) => {
            const headersNames = Object.keys(result);
            this.dataTable.headersSubject.next(headersNames);
            this.getRowsData(this.module, this.table);
          },
          error: (error) => {
            console.error(error);
            this.loading = false;
          }
        }
      );
  }

  getRowsData(module: string, table: string) {
    this.loading = true;
    this.tableService.getAllRows(module, table).subscribe(
      {
        next: (result: any) => {
          this.dataTable.data.next(result);
          this.setColumnsFunctions(module, table);
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        }
      }
    )
  }

  closeColumnsCustomizerModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }


  createColumn() {
    this.columnData = {
      _id: null,
      columnName: "Nueva Columna",
      hidden: false,
      required: false,
      type: ColumnTypes.string,
      module: this.module,
      table: this.table
    }
    this.editColumnName = true;
    this.ngbModal.open(this.colCustomizerModal);
  }

  colunmOperationEnd() {
    this.closeColumnsCustomizerModal();
    this.getColumnsData(this.module, this.table);
  }

  createRow(){
      this.tableService.getAllColumns(this.module, this.table).subscribe(
        (columns: any)=>{
          this.columnData = columns;
          this.ngbModal.open(this.formModal);
        }
      )
  }

  onCreatedRow(){
    if(this.ngbModal.hasOpenModals()){
      this.ngbModal.dismissAll();
      this.getColumnsData(this.module, this.table)
    }
  }

  private createColumnsFunctionsArray(module: string, table: string, colF: IColumnFunctions) {

    const customizeFunc = () => {
      this.tableService.getColumnData(module, table, colF.columnName).subscribe(
        (data: any) => {
          this.editColumnName = false;
          this.columnData = data;
          this.ngbModal.open(this.colCustomizerModal);
        }
      )
    }

    const deleteFunc = () => {
      this.tableService.getColumnData(module, table, colF.columnName).subscribe(
        (data: any) => {
          this.loading = true;
          this.columnData = data;
          this.tableService.deleteColumn(this.columnData).subscribe(
            (_response) => {
              this.getColumnsData(module, table);
            }
          );
        }
      )
    }


    return [
      {
        functionIcon: this.icons.cog,
        functionName: "Personalizar",
        columnFunction: customizeFunc
      },

      // {
      //   functionIcon: this.icons.columnBefore,
      //   functionName: "Insertar columna a la izquierda",
      //   columnFunction: () => { }
      // },

      // {
      //   functionIcon: this.icons.columnNext,
      //   functionName: "Insertar columna a la derecha",
      //   columnFunction: () => { }
      // },

      {
        functionIcon: this.icons.columnDelete,
        functionName: "Eliminar columna",
        columnFunction: deleteFunc
      }

    ]
  }

}
