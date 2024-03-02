import { IconDefinition, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { IModule } from "../interfaces/IModule";
import { IPermission } from "../interfaces/IPermission";
import { Type } from "@angular/core";

export class Module implements IModule {
    customizeViewComponent: Type<unknown> | undefined;
    name!: string;
    label!: string;
    description!: string;
    tables!: any[];
    route?: string | undefined;
    owner?: string | undefined;
    permissions!: IPermission;
    icon?: IconDefinition;
    
    getLink(module: string) {
        return '/tables/' + module;
    };

    getIcon(): IconDefinition {
        return faBuilding;
    }
}