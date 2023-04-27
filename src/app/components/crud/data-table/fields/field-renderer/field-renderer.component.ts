import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import { ICellRestriction, IColumnRestriction } from 'src/app/Model/interfaces/ICellRestrictions';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { RowsRestrictionsService } from 'src/app/services/rows-restrictions.service';
import { BooleanComponent } from '../boolean/boolean.component';
import { DateComponent } from '../date/date.component';
import { FileComponent } from '../file/file.component';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { ListComponent } from '../list/list.component';
import { NumberComponent } from '../number/number.component';
import { StringComponent } from '../string/string.component';

@Component({
  selector: 'eq-field-renderer',
  templateUrl: './field-renderer.component.html',
  styleUrls: ['./field-renderer.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class FieldRendererComponent implements AfterViewInit, OnDestroy {

  @Input() column!: IColumn | undefined;
  @Input() value!: string;
  @Input() restriction: ICellRestriction | undefined;
  @Input() restrictions: Array<Partial<ICellRestriction>> | undefined;
  @Output() valueChange = new EventEmitter<string>();
  @Output() onListChange = new EventEmitter<any>();
  @Output() openModal = new EventEmitter<ColumnTypes>();

  @ViewChild("fieldRenderer", { read: ViewContainerRef }) fieldRenderer!: ViewContainerRef;

  private unsubscribeAll = new Subject<void>();
  private component: any;

  constructor(private cdr: ChangeDetectorRef, private rowsRestriction: RowsRestrictionsService) { }

  ngAfterViewInit(): void {
    this.selectComponent();
    this.subscribeToDataRestrictionChanges();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  subscribeToDataRestrictionChanges() {
    this.rowsRestriction.restrictionsDataSubject
      .pipe(filter(m => m.column?.columnName === this.column?.columnName))
      .subscribe(
        (columnRestriction: IColumnRestriction) => {
          this.restrictions = columnRestriction.restrictions;
          if(!this.component){
            return
          }
          this.component.instance.dataRestrictions = this.restrictions;
        }
      )
  }


  createStringComponent() {
    const checkRestrictionsObserver = this.checkRestriction();
    if (checkRestrictionsObserver) {
      checkRestrictionsObserver.subscribe(
        (value: any) => {
          this.value = value;
          this.valueChange.emit(this.value);
          this.component = this.createComponent(StringComponent);
          this.component.instance.dataRestrictions = this.restrictions;
          this.component.instance.isRestricted = this.column?.isRestricted;
          this.component.instance.restriction = this.restriction;
          this.isFieldDisabledByRestrictions();
          this.subscribeToDataListChange();
          this.subscribeToForeignRestrictionChange();
        }
      );
    } else {
      this.component = this.createComponent(StringComponent);
      this.isFieldDisabledByRestrictions();
      this.subscribeToDataListChange();
      if (this.column?.isRestricted) {
        this.component.instance.isRestricted = this.column?.isRestricted;
        this.subscribeToForeignRestrictionChange();
      }
    }
  }

  selectComponent() {
    switch (this.column?.type) {
      case "string":
        this.createStringComponent()
        break
      case "image":
        const imgComponent = this.createComponent(ImageViewerComponent);
        this.susbscribeToOpenModal(imgComponent);
        break
      case "boolean":
        this.createComponent(BooleanComponent);
        break
      case "date":
        this.createComponent(DateComponent);
        break
      case "number":
        this.createComponent(NumberComponent);
        break
      case "file":
        this.createComponent(FileComponent);
        break
      case "list":
        const listComponent = this.createComponent(ListComponent);
        this.susbscribeToOpenModal(listComponent);
        break
      default:
        this.createComponent(StringComponent)
        break
    }
  }


  subscribeToDataListChange() {
    this.component.instance.onListChange.subscribe(
      (data: Partial<ICellRestriction>) => {
        if (!data) {
          return;
        }
        data.rowId = this.restriction?.rowId;
        this.rowsRestriction.onRestrictionsChange.next(data);
        this.onListChange.emit(data);
      }
    )
  }

  createComponent(fieldComponent: Type<unknown>) {
    const componentInstance: any = this.fieldRenderer.createComponent(fieldComponent);
    componentInstance.instance.value = this.value;
    componentInstance.instance.valueChange.subscribe(
      (value: string) => {
        this.valueChange.emit(value);
      }
    )
    return componentInstance;
  }

  susbscribeToOpenModal(componentInstance: any) {
    componentInstance.instance.openModal.subscribe(
      (type: ColumnTypes) => {
        this.openModal.emit(type);
      }
    )
  }

  isFieldDisabledByRestrictions() {
    if (!this.column) {
      return;
    }
    return this.rowsRestriction.isColumnDisabled(this.column)
      .subscribe(
        (isDisabled: boolean) => {
          this.component.instance.isDisabled = isDisabled;
        }
      );
  }

  checkRestriction() {
    if (!this.restriction) {
      return;
    }
    return this.rowsRestriction.checkRestriction(this.restriction);
  }

  subscribeToForeignRestrictionChange() {
    const onRestrictionsChange = this.rowsRestriction.onRestrictionsChange;
    onRestrictionsChange.pipe(
      filter(this.filterForeignRestrictions),
      takeUntil(this.unsubscribeAll)
    )
      .subscribe(
        (foreignRestriction: Partial<ICellRestriction>) => {
          if (!this.restriction) {
            return;
          }
          if(this.restriction.column.columnName === foreignRestriction.column?.columnName){
            return;
          }
          this.restriction.rowIdRestriction = foreignRestriction.rowIdRestriction;
          this.restriction.deleteMode = foreignRestriction.deleteMode;
          this.onListChange.emit(this.restriction);
          if (foreignRestriction.deleteMode) {
            this.component.instance.value = "";
            return;
          }
          this.checkRestriction()?.subscribe(
            (value: any) => {
              this.component.instance.value = value;
            }
          )
        }
      );

  }

  filterForeignRestrictions = (foreignRestriction: Partial<ICellRestriction>): boolean => {
    if (!foreignRestriction) {
      return false;
    }
    const foreignModule = foreignRestriction.column?.module;
    if (foreignModule !== this.column?.module) {
      return false;
    }
    const foreignTable = foreignRestriction.column?.table;
    if (foreignTable !== this.column?.table) {
      return false;
    }
    const foreignRow = foreignRestriction.rowId;
    if (foreignRow !== this.restriction?.rowId) {
      return false;
    }
    return true;
  }

}