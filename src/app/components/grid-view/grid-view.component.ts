import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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

  icons = {
    edit: faEdit,
    delete: faTrash
  }

}
