import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { TableCustomizerGeneralComponent } from './table-customizer-general/table-customizer-general.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TablePermissionsComponent } from './table-permissions/table-permissions.component';

@Component({
  selector: 'eq-table-customizer',
  templateUrl: './table-customizer.component.html',
  styleUrls: ['./table-customizer.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule,
    TableCustomizerGeneralComponent,
    TablePermissionsComponent,
    NgbNavModule
  ]
})
export class TableCustomizerComponent {

  @Input() tableData!: ITable;
  @Output() tableDataChange = new EventEmitter<ITable>();
  @Input() module: string = "";

  onTableChange(table: ITable) {
    this.tableDataChange.emit(this.tableData);
  }

}
