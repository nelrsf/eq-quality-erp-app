import { EventEmitter } from "@angular/core";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ButtonsFactory";

export type buttonType = 'delete' |
    'save' | 'add' | 'add-column' | 
    'add-folder' | 'add-row' | 'update-column' | 
    'add-entity' | 'add-map' | 'add-form';

export interface IButton {
    tag: buttonType,
    tooltip: string,
    text: string,
    icon: IconDefinition,
    actionEmitter: EventEmitter<void>
    action: (event: any) => void
}

export interface IDropDownButton {
    options: Button[],
    isDropDown: boolean;
}