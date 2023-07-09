import { ColumnTypes } from "src/app/Model/interfaces/IColumn";

export const permissionsColumns = [
    {
        _id: 'Nombre',
        columnName: 'Nombre',
        hidden: true,
        isRestricted: false,
        module: '',
        required: false,
        table: '',
        type: ColumnTypes.string,
        unique: true,
        width: 100
    },
    {
        _id: 'Ver',
        columnName: 'Ver',
        hidden: true,
        isRestricted: false,
        module: '',
        required: false,
        table: '',
        type: ColumnTypes.boolean,
        unique: true,
        width: 100
    },
    {
        _id: 'Editar',
        columnName: 'Editar',
        hidden: true,
        isRestricted: false,
        module: '',
        required: false,
        table: '',
        type: ColumnTypes.boolean,
        unique: true,
        width: 100
    }
]