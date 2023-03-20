import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  private endpointTables = "/tables";
  private endpointColumns = "/columns";
  private endpointRows = "/rows";
  private endpointUpsert = "/upsert";
  private endpointDelete = "/delete";
  private endpointCreate = "/create";

  constructor(private http: HttpClient) { }

  getAllTables(moduleName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName;
    return this.http.get(urlRequest);
  }

  getAllRows(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName;
    return this.http.get(urlRequest);
  }

  createRow(moduleName: string, tableName: string, rowData: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, rowData);
  }

  getColumnData(moduleName: string, tableName: string, columnName: string) {
    const urlRequest = environment.apiUrl + this.endpointColumns + "/" + moduleName + "/" + tableName + "/" + columnName;
    return this.http.get(urlRequest);
  }

  getAllColumns(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointColumns + "/" + moduleName + "/" + tableName;
    return this.http.get(urlRequest);
  }

  upsertColumn(column: IColumn) {
    const urlRequest = environment.apiUrl + this.endpointColumns + this.endpointUpsert;
    return this.http.post(urlRequest, column);
  }

  deleteColumn(column: IColumn) {
    const urlRequest = environment.apiUrl + this.endpointColumns + this.endpointDelete;
    return this.http.post(urlRequest, column);
  }

}
