import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { IPermission } from "./IPermission";

export interface IModule {
    name: string,
    label: string,
    description: string,
    tables: any[],
    route?: string,
    owner?: string,
    permissions: IPermission,
    getLink: (module: string) => string;
    getIcon: () => IconDefinition;
}