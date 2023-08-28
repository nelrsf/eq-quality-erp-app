import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IColumn } from "src/app/Model/interfaces/IColumn";
import { IModule } from "src/app/Model/interfaces/IModule";
import { ISubtable } from "src/app/Model/interfaces/ISubtableValue";
import { ITable } from "src/app/Model/interfaces/ITable";
import { ModulesService } from "src/app/pages/modules/modules.service";
import { TablesService } from "src/app/pages/tables/tables.service";

@Component(
    {
        selector: '[columnSelector]',
        templateUrl: './column-selector.component.html',
        standalone: true,
        imports: [
            CommonModule,
            FormsModule
        ]
    }
)
export class ColumnSelector implements OnInit {

    @Input() module!: IModule;
    @Input() table!: ITable;
    @Input() column!: IColumn;
    @Input() data!: { module: string, table: string, column: string } | undefined;
    @Input() tableFilterCallback: (table: ITable, columnData?: IColumn) => boolean = (table: ITable, columnData?: IColumn) => !table.isFolder;
    @Input() columnData!: IColumn;
    @Output() moduleChange = new EventEmitter<IModule>();
    @Output() tableChange = new EventEmitter<ITable>();
    @Output() columnChange = new EventEmitter<IColumn>();
    @Output() onColumnsChange = new EventEmitter<IColumn[]>();

    modulesForRestriction: Array<IModule> = [];
    tablesForRestriction: Array<ITable> = [];
    columnsForRestriction: Array<IColumn> = [];

    constructor(private tableService: TablesService, private moduleService: ModulesService) { }

    ngOnInit(): void {
        this.searchModules();
    }

    findCurrentModule() {
        if (!this.data?.module) {
            return;
        }
        const currentModule = this.modulesForRestriction.find(
            (m: IModule) => {
                return m.name === this.data?.module;
            }
        );
        if (currentModule) {
            this.module = currentModule;
            this.moduleChange.emit(this.module);
            this.searchTables();
        }
    }

    findCurrentTable() {
        if (!this.data?.table) {
            return;
        }
        const currentTable = this.tablesForRestriction.find(
            (t: ITable) => {
                return t.name === this.data?.table;
            }
        );
        if (currentTable) {
            this.table = currentTable;
            this.tableChange.emit(this.table);
            this.searchColumns();
        }
    }

    findCurrentColumn() {
        if (!this.data?.column) {
            return;
        }
        const currentColumn = this.columnsForRestriction.find(
            (c: IColumn) => {
                return c._id === this.data?.column;
            }
        );
        if (currentColumn) {
            this.column = currentColumn;
            this.columnChange.emit(this.column);
        }
    }



    searchModules() {
        this.moduleService.getAllModules().subscribe(
            (data: any) => {
                this.modulesForRestriction = data;
                this.findCurrentModule();
            }
        )
    }

    searchTables() {
        if (!this.module) {
            return
        }
        this.tableService.getTablesAndFolders(this.module?.name).subscribe(
            (data: any) => {
                this.tablesForRestriction = data.filter(
                    (table: ITable) => {
                        return this.tableFilterCallback(table, this.columnData);
                    }
                );
                this.findCurrentTable();
            }
        );
    }

    searchColumns() {
        if (!this.table?.name) {
            return
        }
        if (!this.module?.name) {
            return
        }
        this.tableService.getAllColumns(
            this.module.name,
            this.table.name)
            .subscribe(
                (data: any) => {
                    this.columnsForRestriction = [];
                    const keys = Object.keys(data);
                    keys.forEach(key => {
                        this.columnsForRestriction.push(data[key]);
                    });
                    this.onColumnsChange.emit(this.columnsForRestriction);
                    this.findCurrentColumn();
                }
            )
    }

    changeModule() {
        this.searchTables();
        this.moduleChange.emit(this.module);
        this.columnsForRestriction = [];
    }

    changeTable() {
        this.searchColumns();
        this.tableChange.emit(this.table);
    }

    changeColumn() {
        this.columnChange.emit(this.column);
    }

}