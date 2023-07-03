import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCogs, faEdit, faFolderTree, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { NavigatorComponent } from '../navigator/navigator.component';

@Component({
  selector: 'eq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NavigatorComponent
  ]
})
export class GridViewComponent {

  constructor(private ngbModal: NgbModal) {

  }

  @ViewChild('navigatorModal') navigatorModal!: ElementRef;

  @Input() data!: IModule[] | ITable[];
  @Input() disableNavigator: boolean = false;
  @Input() moduleName!: string;
  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  @Output() delete = new EventEmitter<string>();
  @Output() configItem = new EventEmitter<IModule | ITable>();

  currentSelectedItem!: ITable;

  icons = {
    edit: faEdit,
    delete: faTrash,
    cogs: faCogs,
    move: faFolderTree
  }

  onDeleteItem(name: string | undefined) {
    if (!name) {
      return;
    }
    this.delete.emit(name);
  }

  onConfigItem(item: IModule | ITable) {
    this.configItem.next(item);
  }


  getDataAsModules() {
    return this.data as IModule[];
  }


  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  openNavigator(item: ITable) {
    this.currentSelectedItem = item;
    this.ngbModal.open(this.navigatorModal);
  }

  
}
