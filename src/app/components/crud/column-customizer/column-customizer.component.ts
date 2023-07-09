import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../../miscelaneous/loading/loading.component';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { GeneralAttributesComponent } from './general-attributes/general-attributes.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsComponent } from './permissions/permissions.component';


@Component({
  selector: 'eq-column-customizer',
  templateUrl: './column-customizer.component.html',
  styleUrls: ['./column-customizer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    GeneralAttributesComponent,
    PermissionsComponent,
    NgbNavModule,
    PermissionsComponent
  ]
})
export class ColumnCustomizerComponent {

  @Input() columnData!: IColumn;
  @Output() columnOperationEnd = new EventEmitter<void>();

  public active: string = 'general';

  onColumnOperationEnd() {
    this.columnOperationEnd.emit();
  }

}
