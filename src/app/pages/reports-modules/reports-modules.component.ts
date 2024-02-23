import { Component, OnInit } from "@angular/core";
import { ModulesService } from "../modules/modules.service";
import { IModule } from "src/app/Model/interfaces/IModule";


@Component(
    {
        selector: 'eq-reports-modules-component',
        templateUrl: './reports-modules.component.html',
    }
)
export class ReportsModulesComponent implements OnInit{

    modules: IModule[] = [];

    constructor(private modulesService: ModulesService){}

    ngOnInit(): void {
        this.getModules();
    }

    getModules(){
        this.modulesService.getAllModules()
        .subscribe(
            (modules: any)=>{
                this.modules = modules;
            }
        )
    }

    getLinkFcn = (value: string | undefined, options: any) => {
        return "/reports/" + value + '/';
    }

}