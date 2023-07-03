import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  private endpointTables = "/tables";
  private endpointMetadata = "/metadata";
  private endpointColumns = "/columns";
  private endpointRows = "/rows";
  private endpointUpsert = "/upsert";
  private endpointUpdate = "/update";
  private endpointDelete = "/delete";
  private endpointCreate = "/create";
  private endpointCustomize = "/customize";

  constructor(private http: HttpClient) { }

  customizeTable(moduleName: string, table: ITable) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCustomize + "/" + moduleName;
    return this.http.post(urlRequest, table);
  }

  createTable(moduleName: string, tableName: string, route: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, {
      module: moduleName,
      table: tableName,
      ...(route ? { route: route } : {})
    });
  }

  createFolder(moduleName: string, tableName: string, route: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, {
      module: moduleName,
      table: tableName,
      isFolder: true,
      ...(route ? { route: route } : {})
    });
  }

  deleteTable(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointDelete + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, {
      module: moduleName,
      table: tableName
    });
  }

  getTableObjectMetadata(moduleName: string, table: string){
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointMetadata + "/" + moduleName + "/" + table;
    return this.http.get(urlRequest);
  }

  getTablesByRoute(moduleName: string, route: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName + "/" + route;
    return this.http.get(urlRequest);
  }

  getAllTables(moduleName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName;
    return this.http.get(urlRequest);
  }

  getAllRows(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName;
    return this.http.get(urlRequest);
  }

  getRowById(moduleName: string, tableName: string, _id: string, column?: string) {
    const columnRequest: string = column ? "/" + column : '';
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName + "/" + _id + columnRequest;
    return this.http.get(urlRequest);
  }

  createRow(moduleName: string, tableName: string, rowData: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, rowData);
  }

  updateRows(moduleName: string, tableName: string, rowData: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointUpdate + "/" + moduleName + "/" + tableName;
    return this.http.patch(urlRequest, rowData);
  }

  deleteRows(moduleName: string, tableName: string, rowsChecked: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointDelete + "/" + moduleName + "/" + tableName;
    return this.http.post(urlRequest, rowsChecked);
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

  getLinkFunction = (value: string | undefined, module: string, item?: any) => {
    if (item.isFolder) {
      return "/tables/" + module + "/" + item.routeParam;
    }
    return "/tables/data/" + module + "/" + value;
  }

}
