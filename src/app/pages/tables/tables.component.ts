import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCog, faSquareCaretLeft, faSquareCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataTableComponent, IColumnFunctions, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { TablesService } from './tables.service';

@Component({
  selector: 'eq-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
})
export class TablesComponent implements OnInit, AfterViewInit {

  icons = {
    cog: faCog,
    columnNext: faSquareCaretRight,
    columnBefore: faSquareCaretLeft,
    columnDelete: faTrash
  }

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  loading = false;
  linkedFields: IMapAsUrl[] = [];
  columnData!: IColumn;


  constructor(private tableService: TablesService, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private router: Router) { }

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
      colF.functions.push(
        ...this.createColumnsFunctionsArray(module, table, colF)
      )
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

  private createColumnsFunctionsArray(module:string, table:string, colF: IColumnFunctions) {

    const customizeFunc = () => {
      this.tableService.getColumnData(module, table, colF.columnName).subscribe(
        (data: any) => {
          const dataStr = JSON.stringify(data).replaceAll("/", "%2F%2F");
          this.columnData = data;
          // this.router.navigate(['columns/' + module + '/' + table + '/' + dataStr])
        }
      )
    }


    return [
      {
        functionIcon: this.icons.cog,
        functionName: "Personalizar",
        columnFunction: customizeFunc
      },

      {
        functionIcon: this.icons.columnBefore,
        functionName: "Insertar columna a la izquierda",
        columnFunction: ()=>{}
      },

      {
        functionIcon: this.icons.columnNext,
        functionName: "Insertar columna a la derecha",
        columnFunction: ()=>{}
      },

      {
        functionIcon: this.icons.columnDelete,
        functionName: "Eliminar columna",
        columnFunction: ()=>{}
      }

    ]
  }

}
