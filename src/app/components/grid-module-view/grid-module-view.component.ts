import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUpRightFromSquare, faCogs, faEdit, faFolderTree, faInfo, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { NavigatorComponent } from '../navigator/navigator.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { ShowIfCanDelete } from 'src/app/directives/permissions/show-if-can-delete.directive';


@Component({
  selector: 'eq-grid-module-view',
  templateUrl: './grid-module-view.component.html',
  styleUrls: ['./grid-module-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NavigatorComponent,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    ShowIfCanDelete
  ]
})
export class GridModuleViewComponent {

  constructor(private ngbModal: NgbModal) { }

  @ViewChild('navigatorModal') navigatorModal!: ElementRef;
  @ViewChild('infoModal') infoModal!: ElementRef;

  @Input() data!: Array<IModule | ITable>;
  @Input() moduleName!: string;

  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  @Output() delete = new EventEmitter<IModule | ITable>();
  @Output() configItem = new EventEmitter<IModule | ITable>();

  currentSelectedItem!: ITable;

  icons = {
    edit: faArrowUpRightFromSquare,
    delete: faTrash,
    cogs: faCogs,
    move: faFolderTree,
    info: faInfoCircle
  }

  infoTitle!: string;
  infoText!: string;

  onDeleteItem(module: IModule | ITable) {
    if (!module) {
      return;
    }
    this.delete.emit(module);
  }

  onConfigItem(item: IModule | ITable) {
    this.configItem.next(item);
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

  getParentModuleName(item: ITable | IModule) {
    if (this.moduleName) {
      return this.moduleName;
    }
    return item.name ? item.name : '';
  }

  showInfo(item: ITable){
    this.infoText = item.description ? item.description: '';
    this.infoTitle = item.label ? item.label: '';
    this.ngbModal.open(this.infoModal);
  }

}
