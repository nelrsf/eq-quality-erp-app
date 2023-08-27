import { IColumnFooter } from "./IColumnFooter"
import { IFormula } from "./IFormula"
import { IPermission } from "./IPermission"
import { ISubtable } from "./ISubtableValue"

export interface IColumn {
    _id: any,
    columnName: string,
    type: ColumnTypes,
    hidden: boolean,
    required: boolean,
    formOrder?: number,
    columnOrder?: number,
    hasFormula?: boolean,
    hasFooter?: boolean,
    footer?: IColumnFooter,
    formula?: IFormula,
    table: string,
    module: string,
    width: number
    unique: boolean,
    isRestricted: boolean,
    moduleRestriction?: string,
    tableRestriction?: string,
    columnRestriction?: string,
    permissions: IPermission,
    linkedTable?: ISubtable
}

export enum ColumnTypes {
    string = 'string',
    number = 'number',
    date = 'date',
    boolean = 'boolean',
    image = 'image',
    file = 'file',
    list = 'list',
    table = 'table'
}