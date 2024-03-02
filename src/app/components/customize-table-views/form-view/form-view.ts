import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { EntityView } from "../view";
import { Module } from "src/app/Model/entities/Module";
import { Form, Table } from "src/app/Model/entities/Table";
import { ColumnSelector } from "src/app/components/crud/column-customizer/columnSelector/column-selector.component";

@Component({
    selector: 'form-view',
    templateUrl: 'form-view.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ColumnSelector
    ]
})
export class FormView extends EntityView {

    @Input() override newEntity!: Table;
    @Output() override newEntityChange: EventEmitter<Table> = new EventEmitter();

    moduleSelectorChange(module: Module) {
        if (this.newEntity instanceof Form) {
            this.newEntity.targetModule = module.name;
        }
    }

    tableSelectorChange(table: Table) {
        if (this.newEntity instanceof Form) {
            this.newEntity.targetTable = table.name;
        }
    }


}