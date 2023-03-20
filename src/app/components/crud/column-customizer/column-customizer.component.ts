import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { LoadingComponent } from '../../miscelaneous/loading/loading.component';


@Component({
  selector: 'eq-column-customizer',
  templateUrl: './column-customizer.component.html',
  styleUrls: ['./column-customizer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent
  ]
})
export class ColumnCustomizerComponent implements OnInit {

  @Input() columnData!: IColumn;
  COLUMN_TYPES = Object.values(ColumnTypes);

  @Input() editColumnName: boolean = false;

  @Output() columnOperationEnd = new EventEmitter<void>();

  constructor(private activedRoute: ActivatedRoute, private tableService: TablesService, private router: Router) {
    this.columnData = {
      _id: null,
      columnName: "",
      hidden: false,
      required: false,
      table: "",
      module: "",
      type: ColumnTypes.string
    }
  }

  ngOnInit(): void {
    const params = this.activedRoute.params;
    params.subscribe((params) => {
      const columnStr = params['columndata'];
      try {
        const columnData = JSON.parse(columnStr);
        if (columnData) {
          Object.assign(this.columnData, columnData)
        }
      } catch {
        console.log("Error parsing JSON")
      }
    })
  }


  getObjToStr() {
    return JSON.stringify(this.columnData)
  }

  onSubmit() {
    this.tableService.upsertColumn(this.columnData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.columnOperationEnd.emit();
          },
          error: (error) => {
            console.log(error);
          }
        }
      );
  }

}
