import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { IPermission } from "./IPermission";
import { Type } from "@angular/core";

export interface IModule {
    name: string,
    label: string,
    description: string,
    tables: any[],
    route?: string,
    owner?: string,
    permissions: IPermission,
    customizeViewComponent: Type<unknown> | undefined;
    getLink: (module: string) => string;
    getIcon: () => IconDefinition;
}