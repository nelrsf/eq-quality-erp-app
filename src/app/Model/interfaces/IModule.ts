export interface IModule {
    name: string,
    label: string,
    description: string,
    tables: any[],
    route?: string
}