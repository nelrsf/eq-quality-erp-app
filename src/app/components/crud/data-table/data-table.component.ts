import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';

export interface IMapAsUrl {
  fieldName: string,
  urlMapFunction: (fieldName: string, row: object) => string;
}

export interface IColumnFunctions {
  columnName: string,
  functions: IColumnFunction[]
}

export interface IColumnFunction {
  functionIcon: IconDefinition,
  columnFunction: () => void;
}

@Component({
  selector: 'eq-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    RouterModule
  ]
})
export class DataTableComponent implements OnInit {

  @Input('mapAsUrl') mapAsUrl: IMapAsUrl[] = [];

  icons = {
    angleLeft: faAngleLeft,
    angleRight: faAngleRight,
  }

  data = new BehaviorSubject<Array<object>>([]);
  headers: Array<string> = [];
  rows: Array<any> = [];
  columnsFunctions: IColumnFunctions[] = [];




  ngOnInit(): void {
    this.data.subscribe((rows) => {
      this.rows = rows;
      this.headers = this.getTableHeaders();
      this.setColumnsFunctions();
    })
  }

  getTableHeaders() {
    if (this.rows.length <= 0) {
      return [];
    }
    return Object.keys(this.rows[0])
  }

  isObject(data: any): boolean {
    return typeof data === 'object';
  }

  getObjectAsString(data: any): string {
    return JSON.stringify(data).replaceAll("/", "%2F%2F");
  }

  isLinkedField(fieldName: string): boolean {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.fieldName === fieldName;
    });
    if (mapAsUrl) {
      return true;
    }
    return false;
  }

  getLinkedText(fieldName: string, row: object): string {
    const mapAsUrl = this.mapAsUrl.find((mapAsUrlElement) => {
      return mapAsUrlElement.fieldName === fieldName;
    });
    if (!mapAsUrl) {
      return "";
    }
    return mapAsUrl.urlMapFunction(fieldName, row);
  }

  private setColumnsFunctions() {
    this.headers.forEach(h => {
      this.columnsFunctions.push({
        columnName: h,
        functions: []
      })
    })
  }

  getFunctionsByColumnName(columnName: string): IColumnFunctions {
    const columnFunctions = this.columnsFunctions.find((colFunctions) => {
      return colFunctions.columnName === columnName;
    })
    if(!columnFunctions){
      return ([] as unknown as IColumnFunctions)
    }
    return columnFunctions;
  }

}
