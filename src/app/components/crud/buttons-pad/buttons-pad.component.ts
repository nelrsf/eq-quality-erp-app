import { Component, ElementRef, EventEmitter, NgModule, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faSearch, faRulerVertical, faBars } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';

@Component({
  selector: 'eq-buttons-pad',
  templateUrl: './buttons-pad.component.html',
  styleUrls: ['./buttons-pad.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    TooltipDirective
  ]
})
export class ButtonsPadComponent {

  icons = {
    new: faPlus,
    update: faPencil,
    delete: faTrash,
    search: faSearch,
    newColumn: faRulerVertical,
    bars: faBars
  }

  @ViewChild("buttonsModal") buttonsModal!: ElementRef;

  @Output() _newRow = new EventEmitter<void>();
  @Output() _updateRows = new EventEmitter<void>();
  @Output() _deleteRows = new EventEmitter<void>();
  @Output() _newColumn = new EventEmitter<void>();
  @Output() _search = new EventEmitter<void>();


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

  openModal() {
    this.ngbModal.open(this.buttonsModal);
  }

}
