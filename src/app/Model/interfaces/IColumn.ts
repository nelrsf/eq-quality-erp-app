export interface IColumn {
    _id: any,
    columnName: string,
    type: ColumnTypes,
    hidden: boolean,
    required: boolean,
    table: string,
    module: string
}

export enum ColumnTypes {
    string = 'string',
    number = 'number',
    date = 'date',
    boolean = 'boolean',
    image = 'image',
    file = 'file',
    list = 'list'
}