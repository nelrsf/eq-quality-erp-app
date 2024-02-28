import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { IModule } from "./IModule";

export type TableModes = 'default' | 'map' | 'form'

export interface ITable extends Partial<IModule> {
    tables?: ITable[],
    routeParam?: string,
    isFolder?: boolean
    viewMode: TableModes;

    getIcon: () => IconDefinition;

    getLink: (module: string) => string
}