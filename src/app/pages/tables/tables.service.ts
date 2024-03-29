import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Table } from 'src/app/Model/entities/Table';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { ITable, TableModes } from 'src/app/Model/interfaces/ITable';
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
  private endpointUpdateRestrictions = "/updaterestrictions";
  private endpointGetRestriction = "/restrictions";
  private endpointDelete = "/delete";
  private endpointCreate = "/create";
  private endpointCustomize = "/customize";

  constructor(private http: HttpClient) { }

  customizeTable(moduleName: string, table: ITable) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCustomize + "/" + moduleName;
    return this.http.post(encodeURI(urlRequest), table);
  }

  createTable(moduleName: string, tableName: string, route: string, entity?: Table) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(encodeURI(urlRequest), {
      ...entity,
      module: moduleName,
      table: tableName,
      ...(route ? { route: route } : {}),
    });
  }

  createFolder(moduleName: string, tableName: string, route: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(encodeURI(urlRequest), {
      module: moduleName,
      table: tableName,
      isFolder: true,
      ...(route ? { route: route } : {})
    });
  }

  deleteTable(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointDelete + "/" + moduleName + "/" + tableName;
    return this.http.post(encodeURI(urlRequest), {
      module: moduleName,
      table: tableName
    });
  }

  getTableObjectMetadata(moduleName: string, table: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + this.endpointMetadata + "/" + moduleName + "/" + table;
    return this.http.get(encodeURI(urlRequest));
  }

  getTablesByRoute(moduleName: string, route: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName + "/" + route;
    return this.http.get(encodeURI(urlRequest));
  }

  getAllTables(moduleName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName;
    return this.http.get(encodeURI(urlRequest));
  }

  getTablesAndFolders(moduleName: string) {
    const urlRequest = environment.apiUrl + this.endpointTables + '/all/' + moduleName;
    return this.http.get(encodeURI(urlRequest));
  }

  getAllRows(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName;
    return this.http.get(encodeURI(urlRequest));
  }

  getRowById(moduleName: string, tableName: string, _id: string, column?: string) {
    const columnRequest: string = column ? "/" + column : '';
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName + "/" + _id + columnRequest;
    return this.http.get(encodeURI(urlRequest));
  }

  getRowsByColumnAndValue(moduleName: string, tableName: string, column: string, value: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + "/filter/" + moduleName + "/" + tableName + "/" + column + '/' + value;
    return this.http.get(encodeURI(urlRequest));
  }

  getRowsByColumnAndSimilarValue(moduleName: string, tableName: string, column: string, value: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + "/filter/similar/" + moduleName + "/" + tableName + "/" + column + '/' + value;
    return this.http.get(encodeURI(urlRequest));
  }

  getRestrictionByIdAndColumn(moduleName: string, tableName: string, columnId: string, rowId: string) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointGetRestriction + "/" + moduleName + "/" + tableName + '/' + rowId + "/" + columnId;
    return this.http.get(encodeURI(urlRequest));
  }

  createRow(moduleName: string, tableName: string, rowData: any, restrictions: Array<any>) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointCreate + "/" + moduleName + "/" + tableName;
    return this.http.post(encodeURI(urlRequest), { row: rowData, restrictions: restrictions });
  }

  updateRows(moduleName: string, tableName: string, rowData: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointUpdate + "/" + moduleName + "/" + tableName;
    return this.http.patch(encodeURI(urlRequest), rowData);
  }

  updateRestrictions(moduleName: string, tableName: string, restrictionsData: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointUpdateRestrictions + "/" + moduleName + "/" + tableName;
    return this.http.patch(encodeURI(urlRequest), restrictionsData);
  }


  updateRowByIdAndColumn(moduleName: string, tableName: string, column: string, rowId: string, row: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointUpdate + "/" + moduleName + "/" + tableName + "/" + column + "/" + rowId;
    return this.http.patch(encodeURI(urlRequest), row);
  }

  deleteRows(moduleName: string, tableName: string, rowsChecked: any) {
    const urlRequest = environment.apiUrl + this.endpointRows + this.endpointDelete + "/" + moduleName + "/" + tableName;
    return this.http.post(encodeURI(urlRequest), rowsChecked);
  }

  getColumnData(moduleName: string, tableName: string, columnId: string) {
    const urlRequest = environment.apiUrl + this.endpointColumns + "/" + moduleName + "/" + tableName + "/" + columnId;
    return this.http.get(encodeURI(urlRequest));
  }

  getAllColumns(moduleName: string, tableName: string) {
    const urlRequest = environment.apiUrl + this.endpointColumns + "/" + moduleName + "/" + tableName;
    return this.http.get(encodeURI(urlRequest));
  }

  upsertColumn(column: IColumn) {
    const urlRequest = environment.apiUrl + this.endpointColumns + this.endpointUpsert;
    return this.http.post(encodeURI(urlRequest), column);
  }

  deleteColumn(column: IColumn) {
    const urlRequest = environment.apiUrl + this.endpointColumns + this.endpointDelete;
    return this.http.post(encodeURI(urlRequest), column);
  }

  getLinkFunction = (value: string | undefined, module: string, item?: any) => {
    if (item.isFolder) {
      return "/tables/" + module + "/" + item.routeParam;
    }
    return "/tables/data/" + module + "/" + value;
  }

}
