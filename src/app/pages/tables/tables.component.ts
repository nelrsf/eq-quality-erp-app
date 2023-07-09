import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCog, faSquareCaretLeft, faSquareCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableComponent, IColumnFunctions, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { ChangesTrackerService } from 'src/app/services/changes-tracker.service';
import { TablesService } from './tables.service';
import { ITable } from 'src/app/Model/interfaces/ITable';

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
  mainRoute: string = '';
  editColumnName: boolean = true;
  columnsMetadata!: any;
  rowsBackup!: any;


  constructor(private tableService: TablesService, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private router: Router, private ngbModal: NgbModal, private changesTracker: ChangesTrackerService) { }

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
    });
    this.cdRef.detectChanges();
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
      this.getRoute();
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
      // this.dataTable.headersSubject.next(headers);
      this.dataTable.data.next([objectdata]);
    }
  }


  ngOnInit(): void {
    //not implemented
  }

  getRoute() {
    this.tableService.getTableObjectMetadata(this.module, this.table)
      .subscribe(
        {
          next: (data: any) => {
            this.mainRoute = data.table_metadata.route;
          },
          error: (error) => {
            console.log(error)
          }
        }
      )
  }

  setLinkedFields(module: string) {
    this.linkedFields.push(
      {
        // fieldName: 'name',
        columnId: '',
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
          // this.dataTable.headersSubject.next(headersNames);
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
            const columnsAsArray = this.convertColumnsToArray(result);
            this.dataTable.columnsSubject.next(columnsAsArray);
            this.getRowsData(this.module, this.table);
          },
          error: (error) => {
            console.error(error);
            this.loading = false;
          }
        }
      );
  }

  convertColumnsToArray(columnsObject: any) {
    const arrayColumns: IColumn[] = [];
    const headers = Object.keys(columnsObject);
    headers.forEach((h) => {
      arrayColumns.push(columnsObject[h]);
    });
    return arrayColumns;
  }

  getRowsData(module: string, table: string) {
    this.loading = true;
    this.tableService.getAllRows(module, table).subscribe(
      {
        next: (result: any) => {
          this.rowsBackup = JSON.parse(JSON.stringify(result));
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

  closeModal() {
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
      table: this.table,
      unique: false,
      width: 100,
      isRestricted: false
    }
    this.editColumnName = true;
    this.ngbModal.open(this.colCustomizerModal, { size: 'xl' });
  }

  colunmOperationEnd() {
    this.closeModal();
    this.getColumnsData(this.module, this.table);
  }

  createRow() {
    this.tableService.getAllColumns(this.module, this.table).subscribe(
      (columns: any) => {
        this.columnData = columns;
        this.ngbModal.open(this.formModal, {
          modalDialogClass: "full-width-modal"
        });
      }
    )
  }

  deleteRows() {
    this.loading = true;
    const rowsChecked = this.dataTable.rowsChecked.filter(rc => rc.checked);
    this.tableService.deleteRows(this.module, this.table, rowsChecked.map(m => m._id))
      .subscribe(
        {
          next: (response) => {
            console.log(response);
            this.getColumnsData(this.module, this.table);
            this.loading = false;
          },
          error: (error) => {
            console.log(error);
            this.loading = false;
          }
        }
      )
  }

  updateRows() {
    const rows = this.dataTable.rows;
    const rowsChanged = this.changesTracker.trackChanges(this.rowsBackup, rows);
    this.loading = true;
    this.tableService.updateRows(this.module, this.table, rowsChanged).subscribe(
      (response: any) => {
        console.log(response);
        this.getColumnsData(this.module, this.table);
      }
    )
  }

  onCreatedRow() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
      this.getColumnsData(this.module, this.table)
    }
  }

  getLinkFunction = (value: string | undefined, item?: any) => {
    return this.tableService.getLinkFunction(value, this.module, item);
  }

  private createColumnsFunctionsArray(module: string, table: string, colF: IColumnFunctions) {

    const customizeFunc = () => {
      this.tableService.getColumnData(module, table, colF.columnId).subscribe(
        (data: any) => {
          this.editColumnName = false;
          this.columnData = data;
          this.ngbModal.open(this.colCustomizerModal, { size: 'xl' });
        }
      )
    }

    const deleteFunc = () => {
      this.tableService.getColumnData(module, table, colF.columnId).subscribe(
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
