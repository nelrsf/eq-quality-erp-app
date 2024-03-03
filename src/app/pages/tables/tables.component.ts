import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCog, faSquareCaretLeft, faSquareCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableComponent, IColumnFunctions, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { ChangesTrackerService } from 'src/app/services/changes-tracker.service';
import { TablesService } from './tables.service';

import { PermissionsService } from 'src/app/services/permissions.service';
import { UserService } from 'src/app/services/user.service';
import { IUser } from 'src/app/Model/interfaces/IUser';
import { Observable, concatMap, forkJoin, from, map, of, switchMap, take } from 'rxjs';
import { ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
import { buttonType } from 'src/app/components/crud/buttons-pad/Ibutton';

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
  @ViewChild('modalError') modalError!: ElementRef;

  loading = false;
  linkedFields: IMapAsUrl[] = [];
  columnData!: IColumn;
  table!: string;
  module!: string;
  mainRoute: string = '';
  editColumnName: boolean = true;
  columnsMetadata!: any;
  rowsBackup!: any;
  buttonsList: Array<buttonType> = [];
  canConfig: boolean = false;
  errorMessage: string = '';


  constructor(private tableService: TablesService, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private permissionsService: PermissionsService, private ngbModal: NgbModal, private changesTracker: ChangesTrackerService, private userService: UserService, private router: Router) { }

  ngAfterViewInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (this.getRowsFromServer(params)) {
        this.initializePermissions();
        this.cdRef.detectChanges();
        return;
      }
      if (this.getDataFromServer(params)) {
        this.initializePermissions();
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

    const subscriberCallback = () => {
      this.dataTable.columnsFunctions.forEach(colF => {
        colF.functions = [];
        colF.functions.push(
          ...this.createColumnsFunctionsArray(module, table, colF)
        )
      });
    }

    this.permissionsService.isAdmin(module)
      .subscribe({
        next: (isAdmin: boolean) => {
          if (isAdmin) {
            if (!this.buttonsList.includes('add-column')) {
              this.buttonsList.push('add-column');
            }
            subscriberCallback();
          }
        }
      });
    this.permissionsService.isOwner(module)
      .subscribe({
        next: (isOwner: boolean) => {
          if (isOwner) {
            if (!this.buttonsList.includes('add-column')) {
              this.buttonsList.push('add-column');
            }
            subscriberCallback();
          }
        }
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
            this.permissionsService.setEditableColumns(columnsAsArray)
              .subscribe(
                {
                  next: (columnsEditPermissions: Array<{ value: boolean, column: string }>) => {
                    this.dataTable.columnsEditPermissions = columnsEditPermissions;
                  }
                }
              );
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
      isRestricted: false,
      permissions: {
        edit: [],
        read: [],
        delete: []
      }
    }
    this.editColumnName = true;
    this.ngbModal.open(this.colCustomizerModal, { size: 'xl', centered: true });
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
      {
        next: (response: any) => {
          console.log(response);
          this.getColumnsData(this.module, this.table);
        },
        error: (error) => {
          this.errorMessage = error.error;
          this.ngbModal.open(this.modalError);
          this.loading = false;
        }
      }
    );
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
          this.editColumnName = true;
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

    const colFunctionsArray = [];

    colFunctionsArray.push({
      functionIcon: this.icons.cog,
      functionName: "Personalizar",
      columnFunction: customizeFunc
    });

    colFunctionsArray.push({
      functionIcon: this.icons.columnDelete,
      functionName: "Eliminar columna",
      columnFunction: deleteFunc
    });

    return colFunctionsArray;

  }

  initializePermissions() {
    this.userService.getUserSubject()
      .subscribe(
        (_user: IUser | null) => {
          this.setButtonsFunctions();
        }
      )
  }


  setTableEditPermission(){
    this.dataTable.editable = true;
  }

  setButtonsFunctions() {
    const subscriberEditCallback = () => {
      if (!this.buttonsList.includes('add')) {
        this.buttonsList.push('add');
      }
      if (!this.buttonsList.includes('save')) {
        this.buttonsList.push('save');
      }
    }

    const subscriberDeleteCallback = () => {
      if (!this.buttonsList.includes('delete')) {
        this.buttonsList.push('delete');
      }
    }

    this.permissionsService.canEditTable(this.module, this.table)
      .subscribe({
        next: (canEdit: boolean) => {
          if (canEdit) {
            subscriberEditCallback();
            this.setTableEditPermission();
          };
        }
      });

    this.permissionsService.canEdit(this.module)
      .subscribe({
        next: (canEdit: boolean) => {
          if (canEdit) {
            subscriberEditCallback();
          }
        }
      });

    this.permissionsService.canDeleteTable(this.module, this.table)
      .subscribe({
        next: (isOwner: boolean) => {
          if (isOwner) {
            subscriberDeleteCallback();
          }
        }
      })

    this.permissionsService.isOwner(this.module)
      .subscribe({
        next: (isOwner: boolean) => {
          if (isOwner) {
            this.canConfig = true;
            subscriberEditCallback();
            subscriberDeleteCallback();
            this.setTableEditPermission();
          }
        }
      })

    this.permissionsService.isAdmin(this.module)
      .subscribe({
        next: (isAdmin: boolean) => {
          if (isAdmin) {
            this.canConfig = true;
            subscriberEditCallback();
            subscriberDeleteCallback();
            this.setTableEditPermission();
          }
        }
      })
  }

  onColumnsOrderChange(_columns: IColumn[]) {
    this.addUpdateColumnButton();
  }

  onColumnsWidthChange(_columns: IColumn[]) {
    this.addUpdateColumnButton();
  }

  addUpdateColumnButton() {
    if (this.canConfig && !this.buttonsList.includes('update-column')) {
      this.buttonsList.push('update-column');
    }
  }

  updateColumns() {
    const columns = this.dataTable.columnsSubject.getValue();
    this.loading = true;

    // Convierte el array de columnas en un Observable
    const columnsObservable = from(columns);

    columnsObservable.pipe(
      concatMap((col: IColumn) => {
        return this.tableService.upsertColumn(col);
      })
    ).subscribe({
      next: (result: any) => {
        console.log(result);
        this.loading = false;
      },
      error: (error: any) => {
        console.log(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        const indx = this.buttonsList.findIndex(b => b == 'update-column');
        this.buttonsList.splice(indx, 1);
      }
    });
  }

  openTableViewer(event: ISubtableValue) {
    const backUrl = `/tables/data/${event?.valueHost?.module}/${event?.valueHost?.table}`;
    this.router.navigate(['./subtable'], { state: { data: event, backUrl: backUrl } });
  }

}
