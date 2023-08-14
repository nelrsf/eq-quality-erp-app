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
}