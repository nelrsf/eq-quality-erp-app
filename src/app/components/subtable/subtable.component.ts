import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ISubtable, ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
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
    RouterModule
  ]
})
export class SubtableComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @Output() dataChange = new EventEmitter<ISubtableValue>();

  tableRows: Array<any> = [];
  currentId: number = 0;
  rowsSelection: IRowChecked[] = [];
  loading: boolean = false;

  data!: ISubtableValue;
  icons = {
    back: faArrowLeftLong
  }

  constructor(private tableService: TablesService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.initializeTable();
    this.initializeTableData();
  }

  initializeTableData() {
    this.tableService.getRowById(this.data.valueHost.module, this.data.valueHost.table, this.data.rowId, this.data.valueHost.column)
      .subscribe(
        {
          next: (result: any) => {
            console.log(result);
            if(!result){
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

  initializeTable() {
    this.data = history.state['data'];

    this.tableService.getAllColumns(this.data.module, this.data.table)
      .subscribe(
        {
          next: (result: any) => {
            const columns = Object.keys(result).map(c => result[c]);
            const replicatedColumns = this.replicateColumns(columns, this.data);
            this.dataTable.columnsSubject.next(replicatedColumns);
            this.dataTable.data.next(this.tableRows);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.log(error);
          }
        }
      )
  }

  replicateColumns(columns: IColumn[], data: ISubtable) {
    const columnsReplicated: IColumn[] = [];
    columns.forEach(
      (c: IColumn) => {
        columnsReplicated.push(
          {
            _id: c._id,
            columnName: c.columnName,
            hidden: c.hidden,
            isRestricted: true,
            module: c.module,
            permissions: c.permissions,
            required: c.required,
            table: c.table,
            type: c.type,
            unique: c._id === data.column,
            width: c.width,
            linkedTable: c.linkedTable,
            columnRestriction: c._id,
            moduleRestriction: data.module,
            tableRestriction: data.table
          }
        )
      }
    );
    return columnsReplicated;
  }

  generateObjectId() {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    const randomPart = Math.floor(Math.random() * 16777215).toString(16);
    const increment = Math.floor(Math.random() * 16777215).toString(16);

    return timestamp + randomPart + increment;
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

  getBackUrl() {
    return `/tables/data/${this.data?.valueHost?.module}/${this.data?.valueHost?.table}`
  }
}
