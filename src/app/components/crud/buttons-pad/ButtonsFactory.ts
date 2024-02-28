import { EventEmitter } from "@angular/core";
import { IconDefinition, faBars, faDiagramNext, faFileCirclePlus, faFolderPlus, faMapLocationDot, faPlus, faRetweet, faSave, faSearch, faTableList, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IButton, IDropDownButton, buttonType } from "./Ibutton";
import { faWpforms } from "@fortawesome/free-brands-svg-icons";

const icons = {
    new: faPlus,
    addEmpty: faDiagramNext,
    update: faSave,
    delete: faTrash,
    search: faSearch,
    newColumn: faTableList,
    bars: faBars,
    addFolder: faFolderPlus,
    refreshColumns: faRetweet,
    addEntity: faFileCirclePlus,
    addForm: faWpforms,
    addMap: faMapLocationDot
  }

export class Button implements IButton {


    constructor(tag: buttonType, actionEmitter: EventEmitter<void>){
        this.tag = tag;
        this.actionEmitter = actionEmitter;
    }

    tag!: buttonType;
    tooltip!: string;
    text!: string;
    icon!: IconDefinition;
    actionEmitter!: EventEmitter<void>;
    action(_event: any) {
        this.actionEmitter.emit();
    }

}

export class AddButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.new;
        this.text = 'Agregar';
        this.tooltip = 'Agregar';
    }

}

export class InsertRowButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.addEmpty;
        this.text = 'Insertar Fila';
        this.tooltip = 'Insertar fila existente';
    }

}

export class AddColumnButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.newColumn;
        this.text = 'Nueva Columna';
        this.tooltip = 'Nueva Columna';
    }
}

export class UpdateColumnsButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.refreshColumns;
        this.text = 'Actualizar Columnas';
        this.tooltip = 'Actualizar Columnas';
    }
}

export class AddFolderButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.addFolder;
        this.text = 'Nuevo Folder';
        this.tooltip = 'Añadir Folder';
    }

}

export class DeleteButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.delete;
        this.text = 'Eliminar';
        this.tooltip = 'Eliminar';
    }
    

}

export class SaveButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.update;
        this.text = 'Guardar cambios';
        this.tooltip = 'Guardar cambios';
    }

}

export class AddEntityButton extends Button implements IDropDownButton {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.addEntity;
        this.text = 'Crear vista';
        this.tooltip = 'Crear una vista personalizada';
    }
    isDropDown: boolean = true;
    options: Button[] = [];

}

export class AddMapButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.addMap;
        this.text = 'Añadir mapa';
        this.tooltip = 'Añadir mapa';
    }
}

export class AddFormButton extends Button {
    constructor(tag: buttonType, actionEmmitter: EventEmitter<void>){
        super(tag, actionEmmitter);
        this.icon = icons.addForm;
        this.text = 'Añadir formulario';
        this.tooltip = 'Añadir formulario';
    }
}

                   

export class ButtonsFactory {

    buttons: Map<buttonType, Button> = new Map<buttonType, Button>();

    registerButton(tag: buttonType, button: Button){
        this.buttons.set(tag, button);
    }

    createButton(tag: buttonType): Button | undefined {
        return this.buttons.get(tag);
    }
}