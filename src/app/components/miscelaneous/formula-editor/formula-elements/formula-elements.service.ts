import { Injectable } from "@angular/core";
import { FormulaElement } from "./element-formula";
import { ColumnTypes, IColumn } from "src/app/Model/interfaces/IColumn";
import { ColumnNumber } from "./column-number";
import { ColumnSubtable } from "./column-subtable";


@Injectable({
    providedIn: 'root'
})
export class FormulaElementsService {
    getElemnt(column: IColumn): FormulaElement | null {
        switch (column.type) {
            case ColumnTypes.number:
                return new ColumnNumber(column);
            case ColumnTypes.table:
                return new ColumnSubtable(column);
            default:
                return null;
        }
    }
}