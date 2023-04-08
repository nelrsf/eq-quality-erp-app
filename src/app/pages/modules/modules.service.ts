import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {

  private modulesEndpoint = "/modules";
  private createEndpoint = "/create";
  private modulesTablesEndpoint = "/modules/modulestables";

  constructor(private http: HttpClient) { }

  createModule(moduleName: string) {
    const url = environment.apiUrl + this.modulesEndpoint + this.createEndpoint;
    return this.http.post(url, { module: moduleName });
  }

  getAllModules() {
    const url = environment.apiUrl + this.modulesEndpoint;
    return this.http.get(url);
  }

  getAllModulesWithTables() {
    const url = environment.apiUrl + this.modulesTablesEndpoint;
    return this.http.get(url);
  }
}
