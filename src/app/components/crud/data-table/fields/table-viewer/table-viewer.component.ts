import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnTypes } from 'src/app/Model/interfaces/IColumn';

@Component({
  selector: 'eq-table-viewer',
  templateUrl: './table-viewer.component.html',
  styleUrls: ['./table-viewer.component.css'],
  standalone: true
})
export class TableViewerButtonComponent {

  @Input() value!: Array<any>;
  @Output() valueChange = new EventEmitter<Array<any>>();
  @Output() openModal = new EventEmitter<ColumnTypes>();

  openModalFcn(){
    this.openModal.emit(ColumnTypes.table);
  }

}
