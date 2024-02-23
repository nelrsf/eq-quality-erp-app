import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IColumnsOverrideData, ISubtable, ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { DataTableComponent, IRowChecked } from '../crud/data-table/data-table.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ButtonsPadComponent } from '../crud/buttons-pad/buttons-pad.component';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { CommonModule } from '@angular/common';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { generateObjectId } from 'src/app/functions/generateObjectId';
import { ShowIfCanEdit } from 'src/app/directives/permissions/show-if-can-edit.directive';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { PermissionsService } from 'src/app/services/permissions.service';
import { combineLatest, map, of, switchMap, take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'eq-subtable',
  templateUrl: './subtable.component.html',
  styleUrls: ['./subtable.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    BreadcrumbComponent,
    ButtonsPadComponent,
    LoadingComponent,
    FontAwesomeModule,
    RouterModule,
    ShowIfCanEdit,
    ShowIfIsAdmin,
    ShowIfIsOwner
  ]
})
export class SubtableComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @Output() dataChange = new EventEmitter<ISubtableValue>();
  @Output() rowsChange = new EventEmitter<Array<any>>();
  @Output() getBackTable = new EventEmitter<void>();
  @Input() data!: ISubtableValue;
  @Input() showBreadCrumb: boolean = true;
  @Input() showBackButton: boolean = true;


  tableRows: Array<any> = [];
  currentId: number = 0;
  rowsSelection: IRowChecked[] = [];
  loading: boolean = false;
  backUrl!: string | (() => void);
  homeUrl!: string;
  oldData: Array<ISubtableValue> = [];
  isEditable: boolean = false;



  icons = {
    back: faArrowLeftLong
  }

  constructor(private userService: UserService, private permissionsService: PermissionsService, private tableService: TablesService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.overrideCreateSubtableDataFcn();
    this.initializeTable();
    this.initializeTableData();
    this.subscribeToEditPermissions();

    this.userService.getUserSubject()
      .subscribe(
        (user: any) => {
          if (!user) return
          this.subscribeToEditPermissions();
          this.permissionsService.setEditableColumns(this.replicateColumns(this.data))
            .subscribe(
              (columnsPermissions: Array<{ value: boolean, column: string }>) => {
                this.dataTable.columnsEditPermissions = columnsPermissions;
              }
            )
        }
      )
  }

  subscribeToEditPermissions() {
    this.getEditPermission()
      .subscribe(
        (isEditable) => {
          this.isEditable = isEditable;
          this.dataTable.editable = isEditable;
        }
      );
  }

  getEditPermission() {
    return this.permissionsService.isOwner(this.data.module).pipe(
      switchMap(isOwner => {
        if (isOwner) {
          return of(true);
        } else {
          return this.permissionsService.isAdmin(this.data.module).pipe(
            switchMap(isAdmin => {
              if (isAdmin) {
                return of(true);
              } else {

                const canEditColumnObs = this.permissionsService.canEditColumn(this.data.valueHost.module, this.data.valueHost.table, this.data.valueHost.column);
                const canEditTableObs = this.permissionsService.canEditTable(this.data.module, this.data.table);

                return combineLatest([canEditColumnObs, canEditTableObs]).pipe(
                  map(([canEditColumn, canEditTable]) => {
                    return canEditColumn && canEditTable;
                  })
                );
              }
            })
          );
        }
      })
    );
  }
  getModuleAndTable() {
    return {
      module: this.data?.valueHost?.module,
      table: this.data?.valueHost?.table
    }
  }

  initializeTableData() {
    if (!this.data.rowId) {
      this.dataTable.data.next(this.data?.rows ? this.data.rows : []);
      this.tableRows = this.dataTable.data.getValue();
      this.cdr.detectChanges();
      return;
    }
    this.tableService.getRowById(this.data.valueHost.module, this.data.valueHost.table, this.data.rowId, this.data.valueHost.column)
      .subscribe(
        {
          next: (result: any) => {
            if (!result) {
              result = [];
            }
            this.dataTable.data.next(result);
            this.tableRows = this.dataTable.data.getValue();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.log(error);
          }
        }
      )
  }

  setColumnsOrder(columns: IColumn[]) {
    columns.forEach(
      (col: IColumn) => {
        const colOverrideFounded = this.findColumn(col._id, this.data.valueHost.columnsOverrideData);
        if (colOverrideFounded) {
          col.columnOrder = colOverrideFounded.order;
        }
      }
    )
  }

  setColumnsVisivility(columns: IColumn[]) {
    columns.forEach(
      (col: IColumn) => {
        const colOverrideFounded = this.findColumn(col._id, this.data.valueHost.columnsOverrideData);
        if (colOverrideFounded) {
          col.hidden = colOverrideFounded.hide;
        }
      }
    )
  }

  setColumnsWidth(columns: IColumn[]) {
    columns.forEach(
      (col: IColumn) => {
        const colOverrideFounded = this.findColumn(col._id, this.data.valueHost.columnsOverrideData);
        if (colOverrideFounded) {
          col.columnWidth = colOverrideFounded.width;
        }
      }
    )
  }

  findColumn(colId: string, columns: IColumnsOverrideData[]) {
    return columns.find((col: IColumnsOverrideData) => col.columnId === colId);
  }

  initializeTable() {
    if (!this.data) {
      this.data = history.state['data'];
      this.backUrl = history.state['backUrl'];
      this.homeUrl = this.backUrl as string;
    }
    const columns = this.replicateColumns(this.data);
    this.setColumnsOrder(columns);
    this.setColumnsVisivility(columns);
    this.setColumnsWidth(columns);
    this.dataTable.columnsSubject.next(columns.filter(c => !c.hidden));
    this.dataTable.data.next(this.tableRows);
    this.cdr.detectChanges();
  }

  replicateColumns(data: ISubtableValue) {
    const columnsReplicated: IColumn[] = [];
    data?.valueHost?.columnsOverrideData?.forEach(
      (c: IColumnsOverrideData) => {
        if (c.isVirtualColumn) {
          columnsReplicated.push(c.virtualColumnData);
          return;
        }
        columnsReplicated.push(
          {
            _id: c.columnId,
            columnName: c.virtualColumnData.columnName,
            hidden: c.virtualColumnData.hidden,
            isRestricted: true,
            module: c.virtualColumnData.module,
            permissions: c.virtualColumnData.permissions,
            required: c.virtualColumnData.required,
            table: c.virtualColumnData.table,
            type: c.virtualColumnData.type,
            unique: c.virtualColumnData._id === data.column,
            width: c.virtualColumnData.width,
            linkedTable: c.virtualColumnData.linkedTable,
            columnRestriction: c.virtualColumnData._id,
            moduleRestriction: data.module,
            tableRestriction: data.table,
            columnOrder: c.virtualColumnData.columnOrder,
            formOrder: c.virtualColumnData.formOrder
          }
        )
      }
    );
    return columnsReplicated;
  }

  generateObjectId() {
    return generateObjectId();
  }

  createEmptyRow() {
    this.tableRows.push({
      _id: this.generateObjectId()
    });
    this.dataTable.data.next(this.tableRows);
  }

  rowsSelectionChange(rows: IRowChecked[]) {
    this.rowsSelection = rows;
  }

  getModule() {
    return this.data?.valueHost?.module;
  }

  deleteRows() {
    this.rowsSelection.forEach(
      (rc: IRowChecked) => {
        if (rc.checked) {
          const index = this.tableRows.findIndex(tr => tr._id === rc._id);
          if (index >= 0) {
            this.tableRows.splice(index, 1);
          }
        }
      }
    )
  }

  saveRows() {
    if (!this.data.rowId) {
      this.rowsChange.emit(this.tableRows);
      return;
    }
    this.data.rows = this.tableRows;
    this.loading = true;
    this.tableService.updateRowByIdAndColumn(this.data.valueHost.module, this.data.valueHost.table, this.data.valueHost.column, this.data.rowId, this.data.rows)
      .subscribe(
        {
          next: (result) => {
            this.loading = false;
            console.log(result);
          },
          error: (error) => {
            this.loading = false;
            console.log(error);
          }
        }
      )
  }

  updateBackUrl() {
    //return `/tables/data/${this.data?.valueHost?.module}/${this.data?.valueHost?.table}`
    this.backUrl = () => {
      if (this.oldData.length === 0) {
        return;
      }
      this.data = this.oldData[this.oldData.length - 1];
      this.initializeTable();
      this.initializeTableData();
      this.oldData.pop();
      if (this.oldData.length === 0) {
        this.backUrl = this.homeUrl;
      }
    };
  }

  openTableViewer(event: ISubtableValue) {
    this.oldData.push(JSON.parse(JSON.stringify(this.data)));
    this.updateBackUrl();
    this.data = event;
    this.overrideCreateSubtableDataFcn();
    this.initializeTable();
    this.initializeTableData();
  }

  getBackUrlType() {
    return typeof this.backUrl;
  }

  getBackUrlAsString() {
    return this.backUrl as string;
  }

  executeBackUrlFcn() {
    const backUrlFcn = this.backUrl as () => void;
    backUrlFcn();
    this.getBackTable.emit();
  }

  onGetBack() {
    this.getBackTable.emit();
  }

  overrideCreateSubtableDataFcn() {
    this.dataTable.createSubtableDataFcn = (rowId: string, column: IColumn, rows: any) => {
      return {
        column: column.linkedTable?.column ? column.linkedTable?.column : '',
        module: column.linkedTable?.module ? column.linkedTable?.module : '',
        table: column.linkedTable?.table ? column.linkedTable?.table : '',
        rows: rows ? rows : [],
        rowId: '',
        valueHost: {
          column: column._id,
          module: column.module,
          table: column.table,
          columnsOverrideData: column.linkedTable?.columnsOverrideData ? column.linkedTable?.columnsOverrideData : []
        }
      }
    }
  }


}
