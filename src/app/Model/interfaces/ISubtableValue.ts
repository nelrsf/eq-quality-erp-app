import { IColumn } from "./IColumn"

export interface ISubtableValue {
    valueHost: ISubtable,
    table: string,
    module: string,
    column: string,
    rows: Array<any>,
    rowId: string
}

export interface ISubtable {
    table: string,
    module: string,
    column: string,
    columnsOverrideData: Array<IColumnsOverrideData>
}

export interface IColumnsOverrideData {
    columnId: string,
    hide: boolean,
    width?: number,
    order: number | undefined,
    isVirtualColumn: boolean,
    virtualColumnData: IColumn
}