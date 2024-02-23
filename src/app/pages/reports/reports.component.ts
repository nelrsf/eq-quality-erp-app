import { Component, OnInit } from "@angular/core";
import { TablesService } from "../tables/tables.service";
import { ActivatedRoute, ActivatedRouteSnapshot, Params } from "@angular/router";
import { ITable } from "src/app/Model/interfaces/ITable";


@Component(
    {
        selector: 'eq.reports-component',
        templateUrl: './reports.component.html',
    }
)
export class ReportsComponent implements OnInit{

    tables: ITable[] = [];
    module!: string;
    route!: string;

    constructor(private tablesService: TablesService, private activatedRoute: ActivatedRoute){}

    ngOnInit(): void {
        this.activatedRoute.params
        .subscribe(
            (params: Params)=>{
                this.module = params['module'];
                this.route = params['route'];
                this.getTables();
            }
        )

    }

    getTables(){
        let tablesObs;

        if(this.route){
            tablesObs = this.tablesService.getTablesByRoute(this.module, this.route);
        } else {
            tablesObs = this.tablesService.getAllTables(this.module);
        }

        tablesObs.subscribe(
            (tables: any)=>{
                this.tables = tables;
            }
        )
    }

    getLinkFcn = (value: string | undefined, item: any) => {
        if(item.isFolder){
            return "/reports/" + this.module + "/" + item.routeParam;
        }
        return "/form/" + this.module + "/" + value;

    }
}