export interface IColumnFooter {
    label?: string,
    operationType: ColumnFooterOperation
}

export interface IFooterOperationData {
    operation: ColumnFooterOperation,
    label: string
}

export enum ColumnFooterOperation {
    SUM = '0',
    AVG = '1',
    COUNT = '2'
}

export const FOOTER_OPERATIONS: IFooterOperationData[] = [
    {
        label: 'Suma',
        operation: ColumnFooterOperation.SUM
    },
    {
        label: 'Promedio',
        operation: ColumnFooterOperation.AVG
    },
    {
        label: 'Conteo',
        operation: ColumnFooterOperation.COUNT
    }
]



