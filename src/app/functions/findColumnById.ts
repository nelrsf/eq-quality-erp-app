import { IColumn } from "../Model/interfaces/IColumn";

export function findColumnById(id: string, columns: IColumn[]): IColumn | undefined {
    return columns.find(
        (col: IColumn) => col._id === id
    )
}