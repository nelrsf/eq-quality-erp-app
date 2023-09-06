import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUpRightFromSquare, faCogs, faEdit, faFileImport, faFolderTree, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { NavigatorComponent } from '../navigator/navigator.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { ShowIfCanDelete } from 'src/app/directives/permissions/show-if-can-delete.directive';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';


@Component({
  selector: 'eq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NavigatorComponent,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    ShowIfCanDelete,
    TooltipDirective
  ]
})
export class GridViewComponent {

  constructor(private ngbModal: NgbModal) { }

  @ViewChild('navigatorModal') navigatorModal!: ElementRef;
  @ViewChild('infoModal') infoModal!: ElementRef;

  @Input() data!: Array<IModule | ITable>;
  @Input() moduleName!: string;

  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  @Output() delete = new EventEmitter<IModule | ITable>();
  @Output() configItem = new EventEmitter<IModule | ITable>();

  currentSelectedItem!: ITable;


  infoTitle!: string;
  infoText!: string;

  icons = {
    edit: faArrowUpRightFromSquare,
    delete: faTrash,
    cogs: faCogs,
    move: faFileImport,
    info: faInfoCircle
  }

  onDeleteItem(item: ITable | IModule) {
    if (!item) {
      return;
    }
    this.delete.emit(item);
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

  getTableData(item: ITable) {
    return {
      table: item.name ? item.name : '',
      module: this.moduleName
    };
  }

  showInfo(item: ITable){
    this.infoText = item.description ? item.description: '';
    this.infoTitle = item.label ? item.label: '';
    this.ngbModal.open(this.infoModal);
  }

}
