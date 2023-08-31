import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { ColumnFooterOperation, FOOTER_OPERATIONS, IColumnFooter } from 'src/app/Model/interfaces/IColumnFooter';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { FormulaEditorComponent } from 'src/app/components/miscelaneous/formula-editor/formula-editor.component';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { TablesService } from 'src/app/pages/tables/tables.service';



@Component({
  selector: 'eq-column-formula',
  templateUrl: './column-formula.component.html',
  styleUrls: ['./column-formula.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    ErrorComponent,
    FormsModule,
    FormulaEditorComponent
  ]
})
export class ColumnFormulaComponent implements OnInit, AfterViewInit {

  @ViewChild('modalError') modalError!: ElementRef;

  @Input() columnData!: IColumn;
  @Input() columns: IColumn[] = [];
  @Input() submitButton: boolean = true;
  @Output() columnOperationEnd: EventEmitter<void> = new EventEmitter<void>();

  loading: boolean = false;
  errorMessage: string = '';
  validFormula!: boolean;
  footer!: IColumnFooter;
  footerOperations = FOOTER_OPERATIONS;

  constructor(private ngbModal: NgbModal, private tableService: TablesService) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    if (!this.columnData.footer?.operationType) {
      this.columnData.footer = {
        operationType: ColumnFooterOperation.SUM,
        label: ''
      }
    }

    this.footer = this.columnData.footer;
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  setFooter() {
    if (!this.columnData.hasFooter) {
      return;
    }
    this.columnData.footer = this.footer;
  }

  saveFormula() {
    this.setFooter();
    this.columnOperationEnd.emit();
  }

}
