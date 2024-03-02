import { EventEmitter } from "@angular/core";
import { Table } from "../../Model/entities/Table";

export class EntityView implements CreateNewEntity, CloseModal {
    newEntity!: Table;
    newEntityChange: EventEmitter<Table> = new EventEmitter();
    closeModal: EventEmitter<void> = new EventEmitter();
    createNewEntity: EventEmitter<void> = new EventEmitter();
    onCloseModal() { 
        this.closeModal.emit();
    };
    onCreateNewEntity() { 
        this.createNewEntity.emit();
    };
}

interface CreateNewEntity {
    onCreateNewEntity: () => void;
}

interface CloseModal {
    onCloseModal: () => void;
}