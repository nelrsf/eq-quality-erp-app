import { IModule } from "./IModule";

export interface ITable extends Partial<IModule>{
    tables?: ITable[],
    routeParam?: string,
    isFolder?: boolean
}