import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCogs, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';

@Component({
  selector: 'eq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule
  ]
})
export class GridViewComponent {

  @Input() data!: IModule[] | ITable[];
  @Input() linkGetterFuntion!: (value: string | undefined) => string

  @Output() delete = new EventEmitter<string>();
  @Output() configItem = new EventEmitter<IModule | ITable>();

  icons = {
    edit: faEdit,
    delete: faTrash,
    cogs: faCogs
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

}
