import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
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
import { Observable, concatMap, forkJoin, from, mergeMap, of, switchMap } from 'rxjs';
import { SubtableComponent } from '../../subtable/subtable.component';
import { ISubtableValue } from 'src/app/Model/interfaces/ISubtableValue';
import { ActivatedRoute, Router } from '@angular/router';
import { ICellRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { RowsRestrictionsService } from 'src/app/services/rows-restrictions.service';
import { FieldRendererComponent } from '../data-table/fields/field-renderer/field-renderer.component';
import { PermissionsService } from 'src/app/services/permissions.service';
import { ShowIfCanEdit } from 'src/app/directives/permissions/show-if-can-edit.directive';


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
    SubtableComponent,
    FieldRendererComponent
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
  autocompleteRestrictions: Array<{ columnId: string, restriction: Array<Partial<ICellRestriction>> }> = [];
  autocompleteSelections: Array<{ columnId: string, restriction: Partial<ICellRestriction> }> = [];
  restriction: ICellRestriction[] = [];
  fieldsEditPermissions: Array<{ value: boolean, column: string }> = [];

  form!: FormGroup;
  COLUMN_TYPES_ENUM = ColumnTypes;
  readMode: boolean = true;

  @Input() columns: any;
  @Input() module!: string;
  @Input() table!: string;
  @Input() row: any = { _id: '_tempId' };
  @Input() padding: string = '';
  @Input() closeButton: boolean = false;
  @Input() componentAccesMode: 'byRoute' | 'bySelector' = 'byRoute';
  @Output() onCloseButton = new EventEmitter();
  @Output() columnsChange = new EventEmitter();
  @Output() formOperationEnd = new EventEmitter();
  @ViewChild("DnDContainer") DnDContainer!: ElementRef;
  @ViewChild("formElement") formElement!: ElementRef;

  constructor(private router: Router, private rederer2: Renderer2, private permissionsService: PermissionsService, private tableService: TablesService, private activatedRoute: ActivatedRoute, private rowsRestrictionService: RowsRestrictionsService) { }


  ngOnInit(): void {

    if (!this.columns) {
      this.getColumnsFromServer();
    } else {
      this.initializeForm();
    }
  }

  disableFields() {
    if (this.formElement) {
      const inputElements = this.formElement.nativeElement.querySelectorAll('input');
      Array.from(inputElements).forEach(
        (element) => {
          this.rederer2.setAttribute(element, "disabled", "true")
        }
      )
    }

  }

  checkFieldsPermissions() {
    this.permissionsService.setEditableColumns(this.getColumnsAsArray())
      .subscribe(
        {
          next: (fieldsEditPermissions: Array<{ value: boolean, column: string }>) => {
            this.fieldsEditPermissions = fieldsEditPermissions;
            fieldsEditPermissions.forEach(
              (fp: { value: boolean, column: string }) => {
                const control = this.form.controls[fp.column];
                if (control && !fp.value) {
                  control.disable();
                }
              }
            )
          }
        }
      );
  }

  checkFormPermissions() {

    const combinedObservable: Observable<boolean> = this.permissionsService.isOwner(this.module).pipe(
      switchMap(isOwner => {
        if (isOwner) {
          return of(true);
        } else {
          return this.permissionsService.canEditTable(this.module, this.table);
        }
      })
    );

    combinedObservable.subscribe(result => {
      this.readMode = !result;
      if (this.readMode) {
        this.disableFields();
      }
    });

  }

  closeForm() {
    this.onCloseButton.emit();
  }

  initializeForm() {
    this.form = new FormGroup(this.createFormControl());
    this.createImagesFormData();
    this.createListFormData();
    this.createSubtableFormData();
    this.initializeAutocompleteRestrictions();
    this.checkFieldsPermissions()
    let orderedColumns = Object.keys(this.columns).sort((a, b) => this.columns[a].formOrder - this.columns[b].formOrder).map(k => this.columns[k]);
    this.columns = orderedColumns;
    this.columnsJson = this.getColumnsAsJson();
    this.checkFormPermissions();
  }

  initializeAutocompleteRestrictions() {
    Object.keys(this.columns).forEach((columnName: string) => {
      const currColumn: IColumn = this.columns[columnName];
      if (!currColumn?.isRestricted) {
        return;
      }

      this.rowsRestrictionService.getColumnRestrictions(currColumn)
        .subscribe(
          {
            next: (restriction: Array<Partial<ICellRestriction>>) => {
              this.autocompleteRestrictions.push({
                columnId: columnName,
                restriction: restriction
              });

              this.setRestrictionByColumn(currColumn);
            },
            error: (error: any) => {
              console.log(error);
            }
          }
        );
    })
  }

  getRestrictionByColumnId(columnId: string) {
    return this.restriction.find(
      (res: ICellRestriction) => {
        return res?.column?._id === columnId
      }
    )
  }

  getAutoCompleteData(columnId: string) {
    const acRestriction = this.autocompleteRestrictions.find(
      (acr: { columnId: string, restriction: Partial<ICellRestriction>[] }) => {
        return acr.columnId === columnId
      }
    );
    if (acRestriction) {
      return acRestriction.restriction;
    } else {
      return []
    }
  }

  onRestricetedValueChange(event: any, columnId: string) {
    this.autocompleteSelections.push({
      columnId: columnId,
      restriction: event
    })
    this.form.controls[columnId].setValue(event.value);
  }


  getColumnsFromServer() {
    this.activatedRoute.params.subscribe(
      (params) => {
        this.module = params['module'] ? params['module'] : this.module;
        this.table = params['table'] ? params['table'] : this.table;
        if (this.module && this.table) {
          this.tableService.getAllColumns(this.module, this.table)
            .subscribe(
              {
                next: (columnsData) => {
                  this.columns = columnsData;
                  this.initializeForm();
                },
                error: (error: any) => {
                  console.log(error);
                }
              }
            )
        }
      })
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
        let colValue = null;
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
    if (this.row?._id && this.row?._id !== '_tempId') {
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
          next: (response: any) => {
            this.rowCreationEnd(this.row);
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
    const restrictions = this.getRestrictions(newRow);
    this.tableService.createRow(module, table, newRow, restrictions)
      .subscribe(
        {
          next: (response: any) => {
            this.rowCreationEnd(response);
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


  setRestrictionByColumn(column: IColumn) {
    if (!column?.isRestricted) {
      return;
    }
    this.tableService.getRestrictionByIdAndColumn(this.module, this.table, column._id, this.row?._id)
      .subscribe(
        {
          next: (res: any) => {
            if (!res && !res?.rowIdRestriction) {
              this.restriction.push({
                column: column,
                rowId: '_tempId',
                value: ''
              })
              return
            }
            const restriction: ICellRestriction = {
              column: column,
              rowId: this.row._id,
              value: this.row[column._id],
              rowIdRestriction: res.rowIdRestriction
            }
            this.restriction.push(restriction);
            const checkRestrictionsObserver = this.rowsRestrictionService.checkRestriction(restriction)
            if (checkRestrictionsObserver) {
              checkRestrictionsObserver.subscribe(
                (value: any) => {
                  this.form.controls[column._id].setValue(value);
                }
              );
            }
          },
          error: (error: any) => {
            console.log(error);
          }
        }
      )



  }

  getRestrictions(row: any) {
    this.autocompleteSelections.forEach(
      (acs: { columnId: string, restriction: Partial<ICellRestriction> }) => {
        acs.restriction.rowId = row._id;
      }
    )
    return this.autocompleteSelections.map(
      (acs: { columnId: string, restriction: Partial<ICellRestriction> }) => {
        return acs.restriction
      }
    );
    // if (newRestrictions.length === 0 || !newRestrictions) {
    //   this.rowCreationEnd(row);
    //   return;
    // }
    // this.tableService.updateRestrictions(this.module, this.table, newRestrictions)
    //   .subscribe(
    //     {
    //       next: (_result: any) => {
    //         this.rowCreationEnd(row);
    //       },
    //       error: (error) => {
    //         this.loading = false;
    //         this.hasError = true;
    //         this.errorMessage = error.error;
    //         console.log(error)
    //       }
    //     }
    //   )
  }

  rowCreationEnd(result: any) {
    console.log(result);
    this.loading = false;
    this.formOperationEnd.emit(result);
    if (this.componentAccesMode === 'byRoute') {
      this.router.navigate(['/formend'], {
        state: {
          row: result,
          columns: this.columns,
          module: this.module,
          table: this.table
        }
      });
    }
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

  getColumnsAsArray() {
    const cols: Array<IColumn> = [];
    Object.keys(this.columns).forEach(
      (colId: string) => {
        cols.push(this.columns[colId])
      }
    );
    return cols;
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
      rows: this.subtableFormData?.hasOwnProperty(column._id) ? this.subtableFormData[column._id] : [],
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
    this.setSeccessMsg();
  }

  setSeccessMsg() {
    const el = document.querySelector('#successtextconf');
    el?.classList.remove('fade-out');
    setTimeout(() => {
      el?.classList.add('fade-out');
    }, 3000)

  }

  isFieldEditable(columnId: string) {
    const fieldEditPermission = this.fieldsEditPermissions.find(
      (fieldData: { value: boolean, column: string }) => {
        return columnId === fieldData.column;
      }
    );
    if (!fieldEditPermission) {
      return false;
    };
    return fieldEditPermission.value;
  }


}
