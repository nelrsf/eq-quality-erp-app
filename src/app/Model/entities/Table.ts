import { IconDefinition, faFolder, faTable } from "@fortawesome/free-solid-svg-icons";
import { IPermission } from "../interfaces/IPermission";
import { ITable, TableModes } from "../interfaces/ITable";
import { faWpforms, faWpressr } from "@fortawesome/free-brands-svg-icons";

export class Table implements ITable {
    tables?: Table[] | undefined;
    routeParam?: string | undefined;
    isFolder?: boolean | undefined;
    viewMode: TableModes = 'default';
    name?: string | undefined;
    label?: string | undefined;
    description?: string | undefined;
    route?: string | undefined;
    owner?: string | undefined;
    permissions?: IPermission | undefined;

    getIcon(): IconDefinition {
        return this.isFolder ? faFolder : faTable;
    }

    getLink(module: string) {
        if (this.isFolder) {
            return "/tables/" + module + "/" + this.routeParam;
        }
        return "/tables/data/" + module + "/" + this.name;
    };

}

export class Form extends Table {

    targetTable?: string;
    targetModule?: string;

    override getLink(module: string): string {
        return "/form/" + this.targetModule + '/' + this.targetTable;
    }

    override getIcon(): IconDefinition {
        return faWpforms;
    }

}