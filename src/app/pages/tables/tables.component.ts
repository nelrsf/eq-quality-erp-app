import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { DataTableComponent, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { TablesService } from './tables.service';

@Component({
  selector: 'eq-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
})
export class TablesComponent implements OnInit, AfterViewInit {

  icons = {
    cog: faCog
  }

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  loading = false;
  linkedFields: IMapAsUrl[] = [];


  constructor(private tableService: TablesService, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (this.getRowsFromServer(params)) {
        this.cdRef.detectChanges();
        return;
      }
      if (this.getDataFromServer(params)) {
        this.cdRef.detectChanges();
        return;
      }
      this.getAuxData(params);
      this.cdRef.detectChanges();
    })
  }

  getDataFromServer(params: any) {
    const module = params['module'];
    if (module) {
      this.getTableData(module);
      return true;
    }
    return false;
  }

  getRowsFromServer(params: any): boolean {
    const module = params['module'];
    const table = params['table'];
    if (module && table) {
      this.getRowsData(module, table);
      return true;
    }
    return false;
  }

  getAuxData(params: any) {
    const objectdataStr = params['objectdata'];
    if (!objectdataStr) {
      return;
    }

    let objectdata;
    try {
      objectdata = JSON.parse(objectdataStr)
    } catch (error) {
      console.log('Error parsing JSON string:');
    };

    if (objectdata) {
      this.dataTable.data.next([objectdata]);
    }
  }


  ngOnInit(): void {
    //not implemented
  }

  setLinkedFields(module: string) {
    this.linkedFields.push(
      {
        fieldName: 'name',
        urlMapFunction: (fieldName: string, row: any) => {
          return "/tables/data/" + module + "/" + row[fieldName];
        }
      }
    )
  }

  setColumnsFunctions(module: string, table: string) {
    this.dataTable.columnsFunctions.forEach(colF => {
      colF.functions.push({
        functionIcon: this.icons.cog,
        columnFunction: ()=>{
          this.tableService.getColumnData(module, table, colF.columnName).subscribe(
            (data: any)=>{
              if(!data){
                return;
              }
              if(Array.isArray(data)){
                this.dataTable.data.next(data);
              } else {
                this.dataTable.data.next([data]);
              }
            }
          )
        }
      })
    })
  }

  getTableData(module: string) {
    this.loading = true;
    this.tableService.getAllTables(module).subscribe(
      {
        next: (result: any) => {
          this.setLinkedFields(module);
          this.dataTable.data.next(result);
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        }
      }
    )
  }

  getRowsData(module: string, table: string) {
    this.loading = true;
    this.tableService.getAllRows(module, table).subscribe(
      {
        next: (result: any) => {
          this.dataTable.data.next(result);
          this.setColumnsFunctions(module, table);
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        }
      }
    )
  }



}
