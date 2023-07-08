import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { TablesService } from 'src/app/pages/tables/tables.service';

@Component({
  selector: 'eq-general-attributes',
  templateUrl: './general-attributes.component.html',
  styleUrls: ['./general-attributes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    LoadingComponent,
    TooltipDirective
  ]
})
export class GeneralAttributesComponent {

  icons={
    alert: faExclamationCircle
  }
  uniqueRestrictionMessage = "Antes de declarar esta columna como única debe asegurarse que no existan valores duplicados, de lo contrario perderá información en las busquedas de datos"

  @Input() columnData!: IColumn;
  COLUMN_TYPES = Object.values(ColumnTypes);

  @Output() columnOperationEnd = new EventEmitter<void>();

  modulesForRestriction: Array<any> = [];
  tablesForRestriction: Array<any> = [];
  columnsForRestriction: Array<any> = [];

  constructor(private activedRoute: ActivatedRoute, private tableService: TablesService, private moduleService: ModulesService) {
    this.columnData = {
      _id: null,
      columnName: "",
      hidden: false,
      required: false,
      table: "",
      module: "",
      width: 100,
      type: ColumnTypes.string,
      unique: false,
      isRestricted: false,
      tableRestriction: "",
      columnRestriction: "",
      moduleRestriction: ""
    }
  }

  ngOnInit(): void {
    this.getRestrictions();
    const params = this.activedRoute.params;
    params.subscribe((params: any) => {
      const columnStr = params['columndata'];
      try {
        const columnData = JSON.parse(columnStr);
        if (columnData) {
          Object.assign(this.columnData, columnData);
          this.getRestrictions();
        }
      } catch {
        console.log("Error parsing JSON")
      }
    })
  }

  getRestrictions() {
    if (this.columnData.isRestricted) {
      this.searchModules();
    }
  }
  


  getObjToStr() {
    return JSON.stringify(this.columnData)
  }

  onSubmit() {
    this.tableService.upsertColumn(this.columnData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.columnOperationEnd.emit();
          },
          error: (error: any) => {
            console.log(error);
          }
        }
      );
  }

  changeModule(){
    this.columnData.tableRestriction = "";
    this.columnData.columnRestriction = "";
    this.searchTables();
  }

  searchModules() {
    if(this.columnData.isRestricted){
      this.columnData.type = ColumnTypes.string;
    }
    this.moduleService.getAllModules().subscribe(
      (data: any) => {
        this.modulesForRestriction = data;
        this.searchTables();
      }
    )
  }

  searchTables() {
    if (!this.columnData?.moduleRestriction) {
      return
    }
    this.tableService.getTablesAndFolders(this.columnData.moduleRestriction).subscribe(
      (data: any) => {
        this.tablesForRestriction = data.filter(
          (table:any)=>{
            return table.name !== this.columnData.table && !table.isFolder;
          }
        );
        this.searchColumns();
      }
    );
  }

  searchColumns() {
    if (!this.columnData?.tableRestriction) {
      return
    }
    if (!this.columnData?.moduleRestriction) {
      return
    }
    this.tableService.getAllColumns(
      this.columnData.moduleRestriction,
      this.columnData.tableRestriction)
      .subscribe(
        (data: any) => {
          this.columnsForRestriction = [];
          const keys = Object.keys(data).filter(
            (colKey) => {
              return data[colKey].type === ColumnTypes.string || data[colKey].type === ColumnTypes.list;
            });
          keys.forEach(key => {
            this.columnsForRestriction.push(data[key]);
          })
        }
      )
  }

}
