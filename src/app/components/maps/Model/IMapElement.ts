export interface IMapElement {
    id?: number,
    name: string,
    type: 'point' | 'path',
    icon: number,
    pathColor: string,
    pathStroke: number,
    moduleRef: string,
    tableRef: string,
    columnRef: string
}