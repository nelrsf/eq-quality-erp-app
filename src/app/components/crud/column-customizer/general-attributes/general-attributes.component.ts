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
import { ColumnSelector } from '../columnSelector/column-selector.component';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { ISubtable } from 'src/app/Model/interfaces/ISubtableValue';

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
    TooltipDirective,
    ColumnSelector
  ]
})
export class GeneralAttributesComponent {

  icons = {
    alert: faExclamationCircle
  }
  uniqueRestrictionMessage = "Antes de declarar esta columna como única debe asegurarse que no existan valores duplicados, de lo contrario perderá información en las busquedas de datos"

  @Input() columnData!: IColumn;
  COLUMN_TYPES = Object.values(ColumnTypes);
  COLUMN_TYPES_ENUM = ColumnTypes;

  @Output() columnOperationEnd = new EventEmitter<void>();

  modulesForRestriction: Array<any> = [];
  tablesForRestriction: Array<any> = [];
  columnsForRestriction: Array<any> = [];

  loading: boolean = false;

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
      moduleRestriction: "",
      permissions: {
        edit: [],
        read: [],
        delete: []
      }
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
      // this.searchModules();
    }
  }



  getObjToStr() {
    return JSON.stringify(this.columnData)
  }

  onSubmit() {
    this.loading = true;
    this.tableService.upsertColumn(this.columnData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.loading = false;
            this.columnOperationEnd.emit();
          },
          error: (error: any) => {
            this.loading = false;
            console.log(error);
          }
        }
      );
  }

  changeModule() {
    this.columnData.tableRestriction = "";
    this.columnData.columnRestriction = "";
    // this.searchTables();
  }

  onRestrictionChange(event: any) {
    const checked = event?.target?.checked;
    if (checked) {
      this.columnData.type = ColumnTypes.string;
    }
  }

  moduleRestrictionChange(module: IModule) {
    this.columnData.moduleRestriction = module.name;
  }

  tableRestrictionChange(table: ITable) {
    this.columnData.tableRestriction = table.name;
  }

  columnRestrictionChange(column: IColumn) {
    this.columnData.columnRestriction = column._id;
  }

  getColumnSelectorData() {
    return { 
      module: this.columnData.moduleRestriction ? this.columnData.moduleRestriction : '', 
      table: this.columnData.tableRestriction ? this.columnData.tableRestriction : '', 
      column: this.columnData.columnRestriction ? this.columnData.columnRestriction : '' 
    }
  }

  getTableFilterCallback(table: ITable, columnData?: IColumn){
    return table.name !== columnData?.table && !table.isFolder;
  }
}
