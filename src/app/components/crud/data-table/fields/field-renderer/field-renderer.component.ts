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
import { TableViewerButtonComponent } from '../table-viewer/table-viewer.component';
import { NumberFieldService } from '../number/number-field.service';


@Component({
  selector: 'eq-field-renderer',
  templateUrl: './field-renderer.component.html',
  styleUrls: ['./field-renderer.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class FieldRendererComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() column!: IColumn | undefined;
  @Input() rowId!: string;
  @Input() value!: string;
  @Input() restriction: ICellRestriction | undefined;
  @Input() restrictions: Array<Partial<ICellRestriction>> | undefined;
  @Output() valueChange = new EventEmitter<string>();
  @Output() onListChange = new EventEmitter<any>();
  @Output() openModal = new EventEmitter<ColumnTypes>();

  @ViewChild("fieldRenderer", { read: ViewContainerRef }) fieldRenderer!: ViewContainerRef;

  private unsubscribeAll = new Subject<void>();
  private component: any;

  constructor(private cdr: ChangeDetectorRef, private rowsRestriction: RowsRestrictionsService, private numberService: NumberFieldService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('value') && this.component?.instance) {
      this.component.instance.value = changes['value'].currentValue;
    }
  }

  ngAfterViewInit(): void {
    this.selectComponentByRestriction();
    this.subscribeToDataRestrictionChanges();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  subscribeToDataRestrictionChanges() {
    this.rowsRestriction.restrictionsDataSubject
      .pipe(filter(m => m.column?._id === this.column?._id))
      .subscribe(
        (columnRestriction: IColumnRestriction) => {
          this.restrictions = columnRestriction.restrictions;
          if (!this.component) {
            return
          }
          this.component.instance.dataRestrictions = this.restrictions;
        }
      )
  }


  initializeForeignRestriction() {
    if (!this.column?.isRestricted) {
      return;
    }
    const checkRestrictionsObserver = this.checkRestriction();
    if (checkRestrictionsObserver) {
      checkRestrictionsObserver.subscribe(
        (value: any) => {
          this.value = value;
          this.valueChange.emit(this.value);
          this.component.instance.value = value;
        }
      );
    }
    this.component.instance.dataRestrictions = this.restrictions;
    this.component.instance.isRestricted = this.column?.isRestricted;
    this.component.instance.restriction = this.restriction;
    this.isFieldDisabledByRestrictions();
    this.subscribeToDataListChange();
    this.subscribeToForeignRestrictionChange();
  }


  selectComponentByRestriction() {
    if (!this.column) {
      return;
    }
    if (this.column?.isRestricted) {
      this.rowsRestriction.getColumnRestrictionData(this.column)
        ?.subscribe(
          (col: any) => {
            this.selectComponent(col);
          }
        )
      return;
    }
    this.selectComponent(this.column);
  }

  selectComponent(column: IColumn) {
    switch (column?.type) {
      case ColumnTypes.string:
        this.component = this.createComponent(StringComponent);
        break
      case ColumnTypes.image:
        this.component = this.createComponent(ImageViewerComponent);
        this.susbscribeToOpenModal(this.component);
        break
      case ColumnTypes.boolean:
        this.component = this.createComponent(BooleanComponent);
        break
      case ColumnTypes.date:
        this.component = this.createComponent(DateComponent);
        break
      case ColumnTypes.number:
        this.component = this.createComponent(NumberComponent);
        this.setCustomNumberInputs();
        break
      case ColumnTypes.file:
        this.component = this.createComponent(FileComponent);
        break
      case ColumnTypes.list:
        this.component = this.createComponent(ListComponent);
        this.susbscribeToOpenModal(this.component);
        break
      case ColumnTypes.table:
        this.component = this.createComponent(TableViewerButtonComponent);
        this.susbscribeToOpenModal(this.component);
        break
      default:
        this.component = this.createComponent(StringComponent)
        break
    }
    this.initializeForeignRestriction();
  }


  setCustomNumberInputs() {
    this.component.instance.columnData = this.column;
    this.component.instance.rowId = this.rowId;
  }


  subscribeToDataListChange() {
    if (!this.component.instance.onListChange) {
      return;
    }
    this.component.instance.onListChange.subscribe(
      (data: Partial<ICellRestriction>) => {
        if (!data) {
          return;
        }
        data.rowId = this.restriction?.rowId;
        this.rowsRestriction.onRestrictionsChange.next(data);
        this.onListChange.emit(data);
        this.valueChange.emit(data.value);
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
          if (this.restriction && !isDisabled) {
            this.rowsRestriction.onRestrictionsChange.next(this.restriction as ICellRestriction);
          }
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
          if (this.restriction.column._id === foreignRestriction.column?._id) {
            return;
          }
          this.restriction.rowIdRestriction = foreignRestriction.rowIdRestriction;
          this.restriction.deleteMode = foreignRestriction.deleteMode;
          this.onListChange.emit(this.restriction);
          this.valueChange.emit(this.restriction.value);
          if (foreignRestriction.deleteMode) {
            this.component.instance.value = "";
            return;
          }
          this.checkRestriction()?.subscribe(
            (value: any) => {
              this.component.instance.value = value;
              this.valueChange.emit(value);
              this.emithNumberValue(value)
            }
          )
        }
      );
  }

  emithNumberValue(value: any) {
    if (this.column?.type !== ColumnTypes.number) {
      return;
    }
    this.numberService.onChange.next({
      columnId: this.column?._id,
      rowId: this.rowId,
      value: parseFloat(value)
    })
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
