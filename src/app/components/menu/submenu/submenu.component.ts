import { CommonModule } from "@angular/common";
import { Component, Directive, Input } from "@angular/core";
import { ITable } from "src/app/Model/interfaces/ITable";
import { MenuComponent } from "../menu.component";
import { RouterModule } from "@angular/router";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component(
    {
        selector: 'eq-submenu',
        templateUrl: './submenu.component.html',
        styleUrls: ['./submenu.component.css', '../menu.component.css'],
        standalone: true,
        imports: [
            CommonModule,
            RouterModule,
            FontAwesomeModule
        ]
    }
)
export class SubmenuComponent {
    @Input() submenu!: ITable;
    @Input() moduleName!: string;

    icons = {
        folder: faFolder
    }

    collapseModule(collapsible: any) {
        collapsible.classList.toggle("show")
    }
}