import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface IValueFurmulaChange {
    subtableId?: string,
    rowId: string,
    columnId: string,
    value: number
}

@Injectable(
    {
        providedIn: 'root'
    }
)
export class NumberFieldService {
    onChange: Subject<IValueFurmulaChange> = new Subject<IValueFurmulaChange>();

}