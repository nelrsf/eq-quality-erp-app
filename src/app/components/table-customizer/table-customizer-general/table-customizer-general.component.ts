import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ITable } from 'src/app/Model/interfaces/ITable';

@Component({
  selector: 'eq-table-customizer-general',
  templateUrl: './table-customizer-general.component.html',
  styleUrls: ['./table-customizer-general.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule
  ]
})
export class TableCustomizerGeneralComponent {

  @Input() tableData!: ITable;
  @Output() tableDataChange = new EventEmitter<ITable>();

  onSubmit() {
    this.tableDataChange.emit(this.tableData);
  }

}
