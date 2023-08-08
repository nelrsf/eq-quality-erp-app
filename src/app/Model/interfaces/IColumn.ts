import { IPermission } from "./IPermission"

export interface IColumn {
    _id: any,
    columnName: string,
    type: ColumnTypes,
    hidden: boolean,
    required: boolean,
    table: string,
    module: string,
    width: number
    unique: boolean,
    isRestricted: boolean,
    moduleRestriction?: string,
    tableRestriction?: string,
    columnRestriction?: string,
    permissions: IPermission
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