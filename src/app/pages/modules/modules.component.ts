import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
  loading: boolean = false;

  constructor(private modulesService: ModulesService, private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.getModulesData();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {

  }

  getModulesData() {
    this.loading = true;
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
        this.loading = false;
        if(this.modules.length === 0){
          return;
        }
        const headers = Object.keys(this.modules[0]);
        this.dataTable.headersSubject.next(headers);
        this.dataTable.data.next(this.modules);
      }
    )
  }

}

