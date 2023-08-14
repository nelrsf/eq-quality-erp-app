import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgModule, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faSearch, faRulerVertical, faBars, faFolderPlus, faSave, faTableList } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';

export type buttonType = 'delete' | 'save' | 'add' | 'add-column' | 'add-folder' | 'add-row';

@Component({
  selector: 'eq-buttons-pad',
  templateUrl: './buttons-pad.component.html',
  styleUrls: ['./buttons-pad.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    TooltipDirective,
    CommonModule
  ]
})
export class ButtonsPadComponent {

  icons = {
    new: faPlus,
    update: faSave,
    delete: faTrash,
    search: faSearch,
    newColumn: faTableList,
    bars: faBars,
    addFolder: faFolderPlus
  }

  @ViewChild("buttonsModal") buttonsModal!: ElementRef;

  @Input() buttonsList: Array<buttonType> = [
    'add', 'add-column', 'delete', 'save'
  ];

  @Output() _newRow = new EventEmitter<void>();
  @Output() _updateRows = new EventEmitter<void>();
  @Output() _deleteRows = new EventEmitter<void>();
  @Output() _newColumn = new EventEmitter<void>();
  @Output() _search = new EventEmitter<void>();
  @Output() _addFolder = new EventEmitter<void>();


  constructor(private ngbModal: NgbModal) { }

  createRow() {
    this._newRow.emit();
  }

  editRows() {
    this._updateRows.emit();
  }

  deleteRows() {
    this._deleteRows.emit();
  }

  createColumn() {
    this._newColumn.emit();
  }

  search() {
    this._search.emit();
  }

  addFolder() {
    this._addFolder.emit();
  }

  openModal() {
    this.ngbModal.open(this.buttonsModal);
  }

  isDisabled(buttonValue: buttonType): boolean {
    return this.buttonsList.includes(buttonValue);
  }

}
