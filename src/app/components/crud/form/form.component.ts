import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faCog, faCogs, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImgFieldComponent } from './imgField/img-field.component';
import { DropTargetDirective } from 'src/app/directives/drop-target.directive';
import { DragDirective } from 'src/app/directives/drag.directive';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ListFieldComponent } from './listField/list-field.component';
import { FileFieldComponent } from './fileField/file-field.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DnDOrderDirective } from 'src/app/directives/order.directive';
import { concatMap, from } from 'rxjs';
import { SubtableComponent } from '../../subtable/subtable.component';
import { ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';


@Component({
  selector: 'eq-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    ImgFieldComponent,
    FileFieldComponent,
    ListFieldComponent,
    DropTargetDirective,
    DragDirective,
    DnDOrderDirective,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    NgbDropdownModule,
    SubtableComponent
  ]
})
export class FormComponent implements OnInit {

  icons = {
    cog: faCog,
    camera: faCamera,
    upload: faUpload,
    addImage: faCirclePlus,
    cogs: faCogs
  }

  imageUrl: string = "";
  imagesFormData: any = {};
  filesFormData: any = {};
  listFormData: any = {};
  subtableFormData: any = {};
  dragging: boolean = false;
  loading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = "";
  columnsJson: any;

  form!: FormGroup;
  COLUMN_TYPES_ENUM = ColumnTypes;

  @Input() columns: any;
  @Input() module!: string;
  @Input() table!: string;
  @Input() row: any;
  @Input() readMode: boolean = false;
  @Output() columnsChange = new EventEmitter();
  @Output() formOperationEnd = new EventEmitter();
  @ViewChild("DnDContainer") DnDContainer!: ElementRef;

  constructor(private tableService: TablesService) { }


  ngOnInit(): void {
    this.form = new FormGroup(this.createFormControl());
    this.createImagesFormData();
    this.createListFormData();
    this.createSubtableFormData();
    let orderedColumns = Object.keys(this.columns).sort((a, b) => this.columns[a].formOrder - this.columns[b].formOrder).map(k => this.columns[k]);
    this.columns = orderedColumns;
    this.columnsJson = this.getColumnsAsJson();
  }


  createFilesFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        if (this.columns[col].type === ColumnTypes.file) {
          this.imagesFormData[col] = [];
        }
      }
    )
  }

  createImagesFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        let colValue = [];
        if (this.columns[col].type === ColumnTypes.image) {
          if (this.row?.hasOwnProperty(col)) {
            colValue = this.row[col];
          }
          this.imagesFormData[col] = colValue;
        }
      }
    )
  }

  getColorScheme() {
    const theme = localStorage.getItem('theme');
    if (theme == 'dark') {
      return 'dark';
    } else {
      return 'unset';
    }
  }

  createListFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        let colValue = [];
        if (this.columns[col].type === ColumnTypes.list) {
          if (this.row?.hasOwnProperty(col)) {
            colValue = this.row[col];
          }
          this.listFormData[col] = colValue;
        }
      }
    )
  }


  createSubtableFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        let colValue = [];
        if (this.columns[col].type === ColumnTypes.table) {
          if (this.row?.hasOwnProperty(col)) {
            colValue = this.row[col];
          }
          this.subtableFormData[col] = colValue;
        }
      }
    )
  }


  createFormControl() {
    const newControls: any = {};
    Object.keys(this.columns).forEach((columnName: string) => {
      let currentValue = this.row && this.row[columnName] ? this.row[columnName] : "";
      currentValue = typeof currentValue === "string" ? currentValue : "";
      newControls[columnName] = new FormControl(currentValue, {});
    });
    return newControls;
  }

  getWidth(column: any): string {
    if (!column.width) {
      return '100%';
    }
    return column.width + "%"
  }


  getStr(data: any) {
    return JSON.stringify(Object.keys(this.columns))
  }

  asignImagesFormData(rowData: any) {
    this.columns.forEach(
      (col: any) => {
        if (col.type === ColumnTypes.image) {
          rowData[col._id] = this.imagesFormData[col._id];
        }
      }
    )
  }

  asignFilesFormData(rowData: any) {
    this.columns.forEach(
      (col: any) => {
        if (col.type === ColumnTypes.file) {
          rowData[col._id] = this.imagesFormData[col._id];
        }
      }
    )
  }

  asignListFormData(rowData: any) {
    this.columns.forEach(
      (col: any) => {
        if (col.type === ColumnTypes.list) {
          rowData[col._id] = this.listFormData[col._id];
        }
      }
    )
  }

  asignSubtableFormData(rowData: any) {
    this.columns.forEach(
      (col: any) => {
        if (col.type === ColumnTypes.table) {
          rowData[col._id] = this.subtableFormData[col._id];
        }
      }
    )
  }

  onSubmit() {
    if (this.form.status === "INVALID") {
      return;
    }
    this.loading = true;
    this.hasError = false;
    this.errorMessage = "";
    let newRow: any = {};
    this.columns.forEach(
      (col: any) => {
        newRow[col._id] = this.form.controls[col._id].value;
      }
    )
    this.asignImagesFormData(newRow);
    this.asignListFormData(newRow);
    this.asignFilesFormData(newRow);
    this.asignSubtableFormData(newRow);
    if (this.row?._id) {
      this.updateRow(this.module, this.table, newRow, this.row._id);
    } else {
      this.createRow(this.module, this.table, newRow);
    }
  }

  updateRow(module: string, table: string, newRow: any, id: string) {
    newRow._id = id;
    this.tableService.updateRows(module, table, [newRow])
      .subscribe(
        {
          next: (response) => {
            console.log(response);
            this.loading = false;
            this.formOperationEnd.emit();
          },
          error: (error) => {
            this.loading = false;
            this.hasError = true;
            this.errorMessage = error.error;
            console.log(error)
          }
        }
      );
  }

  createRow(module: string, table: string, newRow: any) {
    this.tableService.createRow(module, table, newRow)
      .subscribe(
        {
          next: (response) => {
            console.log(response);
            this.loading = false;
            this.formOperationEnd.emit();
          },
          error: (error) => {
            this.loading = false;
            this.hasError = true;
            this.errorMessage = error.error;
            console.log(error)
          }
        }
      );
  }

  submitConfiguration(event: Event) {
    event.preventDefault();
  }

  getColumnsAsJson() {
    const jsonCols: any = {};
    this.columns.forEach(
      (col: any) => {
        jsonCols[col._id] = col;
      }
    );
    return jsonCols;
  }


  updateColumns() {
    const columns: IColumn[] = this.columns;
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
      }
    });
  }


  getSubtableData(column: IColumn): ISubtableValue {
    return {
      column: column.linkedTable?.column ? column.linkedTable?.column : '',
      module: column.linkedTable?.module ? column.linkedTable?.module : '',
      table: column.linkedTable?.table ? column.linkedTable?.table : '',
      rows: this.row?.hasOwnProperty(column._id) ? this.row[column._id] : [],
      rowId: '',
      valueHost: {
        column: column._id,
        module: column.module,
        table: column.table,
        columnsOverrideData: column.linkedTable?.columnsOverrideData ? column.linkedTable?.columnsOverrideData : []
      }

    }
  }

  onSubtableChange(rows: Array<any>, column: IColumn) {
    this.subtableFormData[column._id] = rows;
  }
}
