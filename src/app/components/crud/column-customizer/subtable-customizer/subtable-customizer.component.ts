import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColumnSelector } from '../columnSelector/column-selector.component';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { TablesService } from 'src/app/pages/tables/tables.service';

@Component({
  selector: 'eq-subtable-customizer',
  templateUrl: './subtable-customizer.component.html',
  styleUrls: ['./subtable-customizer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ColumnSelector
  ]
})
export class SubtableCustomizerComponent implements OnInit {

  @Input() columnData!: IColumn;
  @Output() columnOperationEnd = new EventEmitter<void>();

  module!: IModule;
  table!: ITable;
  column!: IColumn;

  loading: boolean = false;

  constructor(private tableService: TablesService) { }

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData() {
    if (this.columnData?.linkedTable) {

    }
  }

  submitSubtableData() {
    this.columnData.linkedTable = {
      column: this.column?._id ? this.column._id : '',
      module: this.module?.name ? this.module.name : '',
      table: this.table?.name ? this.table.name : ''
    }

    this.loading = true;
    this.tableService.upsertColumn(this.columnData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.loading = false;
            this.columnOperationEnd.emit();
          },
          error: (error: any) => {
            this.loading = false;
            console.log(error);
          }
        }
      );

  }

  getTablesFilterCallback(table: ITable, columnData?: IColumn) {
    return table.name !== columnData?.table && !table.isFolder;
  }
}
