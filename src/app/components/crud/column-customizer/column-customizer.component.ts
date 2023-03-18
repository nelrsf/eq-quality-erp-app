import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private activedRoute: ActivatedRoute, private tableService: TablesService) {
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
      // this.module = params['module'];
      // this.table = params['table'];
      // this.columnData.table = this.table;
      // this.columnData.module = this.module;
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
    if (this.columnData._id) {
      this.tableService.updateColumn(this.columnData)
      .subscribe(
        {
          next: (data)=>{
            console.log(data);
          },
          error: (error)=>{
            console.log(error);
          }
        }
      );
    } else {
      console.log(this.columnData)
      this.tableService.createColumn(this.columnData)
      .subscribe(
        {
          next: (data)=>{
            console.log(data);
          },
          error: (error)=>{
            console.log(error);
          }
        }
      );
    }
  }

}
