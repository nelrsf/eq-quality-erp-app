import { IColumn } from "./IColumn";

export interface IColumnRestriction {
    column?: IColumn,
    restrictions: Array<Partial<ICellRestriction>>
  }

export interface ICellRestriction {
    column: IColumn,
    rowId: string,
    rowIdRestriction?: string,
    value: any,
    deleteMode?: boolean
}