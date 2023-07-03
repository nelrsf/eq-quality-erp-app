import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { IModule } from 'src/app/Model/interfaces/IModule';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {

  private modulesEndpoint = "/modules";
  private createEndpoint = "/create";
  private customizeEndpoint = "/customize";
  private deleteEndpoint = "/delete";
  private modulesTablesEndpoint = "/modules/modulestables";

  constructor(private http: HttpClient) { }

  customizeModule(module: IModule) {
    const url = environment.apiUrl + this.modulesEndpoint + this.customizeEndpoint;
    return this.http.post(encodeURI(url), module);
  }

  createModule(moduleName: string) {
    const url = environment.apiUrl + this.modulesEndpoint + this.createEndpoint;
    return this.http.post(encodeURI(url), { module: moduleName });
  }

  deleteModule(moduleName: string) {
    const url = environment.apiUrl + this.modulesEndpoint + this.deleteEndpoint;
    return this.http.post(encodeURI(url), { module: moduleName });
  }

  getAllModules() {
    const url = environment.apiUrl + this.modulesEndpoint;
    return this.http.get(encodeURI(url));
  }

  getAllModulesWithTables() {
    const url = environment.apiUrl + this.modulesTablesEndpoint;
    return this.http.get(encodeURI(url));
  }
}
