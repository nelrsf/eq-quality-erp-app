import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  private endpointTables = "/tables";
  private endpointColumns = "/columns";
  private endpointRows = "/rows";

  constructor(private http: HttpClient) { }

  getAllTables(moduleName: string){
    const urlRequest = environment.apiUrl + this.endpointTables + "/" + moduleName;
    return this.http.get(urlRequest);
  }

  getAllRows(moduleName: string, tableName: string){
    const urlRequest = environment.apiUrl + this.endpointRows + "/" + moduleName + "/" + tableName;
    return this.http.get(urlRequest);
  }

  getColumnData(moduleName: string, tableName: string, columnName: string){
    const urlRequest = environment.apiUrl + this.endpointColumns + "/" + moduleName + "/" + tableName + "/" + columnName;
    return this.http.get(urlRequest);
  }
}
