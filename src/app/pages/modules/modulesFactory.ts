import { Module } from "src/app/Model/entities/Module";
import { Type } from "@angular/core";
import { IModule } from "src/app/Model/interfaces/IModule";
import { TablesFactory } from "../tables-sumary/tables-factory";

export class ModulesFactory {

    entities: Map<string, Type<Module>> = new Map();

    constructor() {
        this.entities.set('default', Module);
    }

    convertEntity(entity: Module, viewMode: string) {
        let moduleType = this.entities.get(viewMode);
        if (!moduleType) {
            moduleType = Module;
        }
        let newTableEntity: Module = new moduleType();
        Object.assign(newTableEntity, entity);
        return newTableEntity;
    }

    convertManyEntities(entities: IModule[]) {
        const arrayEntities: Module[] = []
        const tablesFactory: TablesFactory = new TablesFactory();
        entities.forEach(
            (t: Module) => {
                const mConverted = this.convertEntity(t, "default");
                if (mConverted.tables && mConverted.tables.length > 0) {
                    mConverted.tables = tablesFactory.convertManyEntities(mConverted.tables)
                }
                if (mConverted) {
                    arrayEntities.push(mConverted);
                }
            }
        );
        return arrayEntities;
    }


}