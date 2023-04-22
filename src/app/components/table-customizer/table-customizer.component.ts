import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ITable } from 'src/app/Model/interfaces/ITable';

@Component({
  selector: 'eq-table-customizer',
  templateUrl: './table-customizer.component.html',
  styleUrls: ['./table-customizer.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule
  ]
})
export class TableCustomizerComponent {

  @Input() tableData!: ITable;
  @Output() tableDataChange = new EventEmitter<ITable>();

  onSubmit() {
    this.tableDataChange.emit(this.tableData);
  }

}
