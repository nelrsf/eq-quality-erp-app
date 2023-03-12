import { Injectable, OnInit } from '@angular/core';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { TablesService } from 'src/app/pages/tables/tables.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {


  constructor(private moduleService: ModulesService) { }


  getModules() {
    return this.moduleService.getAllModulesWithTables();
  }
}
