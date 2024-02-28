import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgModule, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faSearch, faRulerVertical, faBars, faFolderPlus, faSave, faTableList, faRetweet, faDiagramNext } from '@fortawesome/free-solid-svg-icons';
import { NgbDropdown, NgbDropdownModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { buttonType } from './Ibutton';
import { AddButton, AddColumnButton, AddEntityButton, AddFolderButton, AddFormButton, AddMapButton, Button, ButtonsFactory, DeleteButton, InsertRowButton, SaveButton, UpdateColumnsButton } from './ButtonsFactory';

@Component({
  selector: 'eq-buttons-pad',
  templateUrl: './buttons-pad.component.html',
  styleUrls: ['./buttons-pad.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    TooltipDirective,
    NgbDropdownModule,
    CommonModule
  ]
})
export class ButtonsPadComponent {



  @ViewChild("buttonsModal") buttonsModal!: ElementRef;

  @Input() buttonsList: Array<buttonType> = [
    'add', 'add-column', 'delete', 'save'
  ];

  @Output() _newRow = new EventEmitter<void>();
  @Output() _addEmptyRow = new EventEmitter<void>();
  @Output() _updateRows = new EventEmitter<void>();
  @Output() _deleteRows = new EventEmitter<void>();
  @Output() _newColumn = new EventEmitter<void>();
  @Output() _updateColumn = new EventEmitter<void>();
  @Output() _search = new EventEmitter<void>();
  @Output() _addFolder = new EventEmitter<void>();
  @Output() _addEntity = new EventEmitter<void>();
  @Output() _addMap = new EventEmitter<void>();
  @Output() _addForm = new EventEmitter<void>();

  buttons: Button[] = [];
  buttonsModalInstance!: NgbModalRef;

  icons = {
    bars: faBars
  }

  constructor(private ngbModal: NgbModal) {
    this.registerButtons();
  }

  registerButtons() {
    const buttonsFactory = new ButtonsFactory();
    buttonsFactory.registerButton('delete', new DeleteButton('delete', this._deleteRows));
    buttonsFactory.registerButton('save', new SaveButton('save', this._updateRows));
    buttonsFactory.registerButton('add', new AddButton('add', this._newRow));
    buttonsFactory.registerButton('add-column', new AddColumnButton('add-column', this._newColumn));
    buttonsFactory.registerButton('add-folder', new AddFolderButton('add-folder', this._addFolder));
    buttonsFactory.registerButton('add-row', new DeleteButton('add-row',this._newRow));
    buttonsFactory.registerButton('update-column', new UpdateColumnsButton('update-column', this._updateColumn));
    buttonsFactory.registerButton('add-row', new InsertRowButton('add-row', this._addEmptyRow));
    const mapButton = new AddMapButton('add-map', this._addMap);
    buttonsFactory.registerButton('add-map', mapButton);
    const formButton = new AddFormButton('add-form', this._addForm);
    buttonsFactory.registerButton('add-form', formButton);
    const addEntity = new AddEntityButton('add-entity', this._addEntity);
    addEntity.options.push(formButton);
    addEntity.options.push(mapButton);
    buttonsFactory.registerButton('add-entity', addEntity);

    this.buttons.push(buttonsFactory.createButton('delete') as Button);
    this.buttons.push(buttonsFactory.createButton('save') as Button);
    this.buttons.push(buttonsFactory.createButton('add') as Button);
    this.buttons.push(buttonsFactory.createButton('add-row') as Button);
    this.buttons.push(buttonsFactory.createButton('add-column') as Button);
    this.buttons.push(buttonsFactory.createButton('add-folder') as Button);
    this.buttons.push(buttonsFactory.createButton('update-column') as Button);
    this.buttons.push(buttonsFactory.createButton('add-entity') as Button);
  }

  clickButton(event: any, button: Button) {
    button.action(event);
    if (this.buttonsModalInstance) {
      this.buttonsModalInstance.close();
    }
  }

  getActiveButtons() {
    return this.buttons.filter((b: Button) => this.isActive(b.tag));
  }


  openModal() {
    this.buttonsModalInstance = this.ngbModal.open(this.buttonsModal);
  }

  isActive(buttonValue: buttonType): boolean {
    return this.buttonsList.includes(buttonValue);
  }

  isDropDown(button: any): boolean{
    return button.isDropDown; 
  }

  getDropDownOptions(button: any){
    return button?.options ? button.options : [];
  }

}
