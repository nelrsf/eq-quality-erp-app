import { Type } from "@angular/core";
import { Form, Table } from "src/app/Model/entities/Table";
import { ITable, TableModes } from "src/app/Model/interfaces/ITable";

export class TablesFactory {
    entities: Map<TableModes, Type<Table>> = new Map();

    constructor() {
        this.entities.set('default', Table);
        this.entities.set('form', Form);
    }

    convertEntity(entity: ITable) {
        let tableType = this.entities.get(entity.viewMode);
        if (!tableType) {
            tableType = Table;
        }
        let newTableEntity: Table = new tableType();
        Object.assign(newTableEntity, entity);
        return newTableEntity;
    }

    convertManyEntities(entities: ITable[]) {
        const arrayEntities: Table[] = []
        entities.forEach(
            (t: Table) => {
                const tConverted = this.convertEntity(t);
                if (tConverted.tables && tConverted.tables.length > 0) {
                    tConverted.tables = this.convertManyEntities(tConverted.tables)
                }
                if(tConverted){
                    arrayEntities.push(tConverted);
                }
            }
        );
        return arrayEntities;
    }
}