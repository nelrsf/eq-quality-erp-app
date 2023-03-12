import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DataTableComponent, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ModulesService } from './modules.service';

@Component({
  selector: 'eq-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  modules!: object[];
  linkedFields: IMapAsUrl[] = [];

  constructor(private modulesService: ModulesService) { }

  ngAfterViewInit(): void {
    this.getModulesData();
  }

  ngOnInit(): void {

  }

  getModulesData() {
    this.modulesService.getAllModules().subscribe(
      (data: any) => {
        this.modules = data;
        this.linkedFields.push(
          {
            fieldName: 'name',
            urlMapFunction: (fieldName: string, row: any) => {
              return "/tables/" + row[fieldName]
            }
          }
        )
        this.dataTable.data.next(this.modules);
      }
    )
  }

}

