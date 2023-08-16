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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ListFieldComponent } from './listField/list-field.component';
import { FileFieldComponent } from './fileField/file-field.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';


@Component({
  selector: 'eq-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    ImgFieldComponent,
    FileFieldComponent,
    ListFieldComponent,
    DropTargetDirective,
    DragDirective,
    ShowIfIsAdmin,
    ShowIfIsOwner
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
  dragging: boolean = false;
  loading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = "";

  form!: FormGroup;

  @Input() columns: any;
  @Input() module!: string;
  @Input() table!: string;
  @Output() columnsChange = new EventEmitter();
  @Output() formOperationEnd = new EventEmitter();
  @ViewChild("DnDContainer") DnDContainer!: ElementRef;

  constructor(private tableService: TablesService) { }


  ngOnInit(): void {
    this.form = new FormGroup(this.createFormControl());
    this.createImagesFormData();
    this.createListFormData();
  }

  createFilesFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        if(this.columns[col].type === ColumnTypes.file){
          this.imagesFormData[col] = [];
        }
      }
    )
  }

  createImagesFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        if(this.columns[col].type === ColumnTypes.image){
          this.imagesFormData[col] = [];
        }
      }
    )
  }

  getColorScheme(){
    const theme = localStorage.getItem('theme');
    if(theme=='dark'){
      return 'dark';
    } else {
      return 'unset';
    }
  }

  createListFormData() {
    Object.keys(this.columns).forEach(
      (col: string) => {
        if(this.columns[col].type === ColumnTypes.list){
          this.listFormData[col] = [];
        }
      }
    )
  }


  createFormControl() {
    const newControls: any = {}
    Object.keys(this.columns).forEach((columnName: string) => {
      newControls[columnName] = new FormControl("", {});
    });
    return newControls;
  }

  getWidth(data: any): string {
    const column = this.getAsColumn(data);
    if (!column.width) {
      return '100%';
    }
    return column.width + "%"
  }

  getAsColumn(data: any) {
    return data as IColumn;
  }

  getStr(data: any) {
    return JSON.stringify(Object.keys(this.columns))
  }

  asignImagesFormData(rowData: any){
    Object.keys(this.columns).forEach(
      (columnName) => {
        if(this.columns[columnName].type === ColumnTypes.image){
          rowData[columnName] = this.imagesFormData[columnName];
        }
      }
    )
  }

  asignFilesFormData(rowData: any){
    Object.keys(this.columns).forEach(
      (columnName) => {
        if(this.columns[columnName].type === ColumnTypes.file){
          rowData[columnName] = this.imagesFormData[columnName];
        }
      }
    )
  }

  asignListFormData(rowData: any){
    Object.keys(this.columns).forEach(
      (columnName) => {
        if(this.columns[columnName].type === ColumnTypes.list){
          rowData[columnName] = this.listFormData[columnName];
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
    Object.keys(this.columns).forEach(
      (columnId) => {
        newRow[columnId] = this.form.controls[columnId].value;
      }
    )
    this.asignImagesFormData(newRow);
    this.asignListFormData(newRow);
    this.asignFilesFormData(newRow);
    this.tableService.createRow(this.module, this.table, newRow)
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
            this.formOperationEnd.emit();
            console.log(error)
          }
        }
      );
  }

  submitConfiguration(event: Event) {
    event.preventDefault();
  }

  getColumnName(column: any){
    return column.columnName;
  }

  onReorderColumns(event: any){
    console.log(event)
  }
}
