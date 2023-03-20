import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImgFieldComponent } from './imgField/img-field.component';
import { DropTargetDirective } from 'src/app/directives/drop-target.directive';
import { DragDirective } from 'src/app/directives/drag.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TablesService } from 'src/app/pages/tables/tables.service';

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
    DropTargetDirective,
    DragDirective
  ]
})
export class FormComponent implements OnInit {

  icons = {
    drag: faUpDownLeftRight,
    camera: faCamera,
    upload: faUpload,
    addImage: faCirclePlus
  }

  imageUrl: string = "";
  dragging: boolean = false;
  loading: boolean = false;

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
  }

  createFormControl() {
    const newControls: any = {}
    Object.keys(this.columns).forEach((columnName: string) => {
      newControls[columnName] = new FormControl("", {});
    });
    return newControls;
  }


  getAsColumn(data: any) {
    return data as IColumn;
  }

  getStr(data: any) {
    return JSON.stringify(Object.keys(this.columns))
  }

  onSubmit() {
    if (this.form.status === "INVALID") {
      return;
    }
    this.loading = true;
    let newRow: any = {};
    Object.keys(this.columns).forEach(
      (columnName) => {
        newRow[columnName] = this.form.controls[columnName].value;
      }
    )
    this.tableService.createRow(this.module, this.table, newRow)
      .subscribe(
        {
          next: (response) => {
            console.log(response);
            this.loading = false;
            this.formOperationEnd.emit();
          },
          error: (error)=>{
            this.loading = false;
            console.log(error)
          }
        }
      );
  }
}
