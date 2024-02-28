import { IconDefinition, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { IModule } from "../interfaces/IModule";
import { IPermission } from "../interfaces/IPermission";
import { faRProject } from "@fortawesome/free-brands-svg-icons";

export class Module implements IModule {
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