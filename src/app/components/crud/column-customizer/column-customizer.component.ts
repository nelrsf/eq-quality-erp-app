import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../../miscelaneous/loading/loading.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { GeneralAttributesComponent } from './general-attributes/general-attributes.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsComponent } from './permissions/permissions.component';
import { SubtableCustomizerComponent } from './subtable-customizer/subtable-customizer.component';
import { ColumnFormulaComponent } from './column-formula/column-formula.component';
import { TablesService } from 'src/app/pages/tables/tables.service';


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
    PermissionsComponent,
    SubtableCustomizerComponent,
    ColumnFormulaComponent
  ]
})
export class ColumnCustomizerComponent {

  @Input() columnData!: IColumn;
  @Output() columnOperationEnd = new EventEmitter<void>();

  COLUMN_TYPES_ENUM = ColumnTypes;

  public active: string = 'general';
  public loading: boolean = false;

  constructor(private tableService: TablesService){}

  onColumnOperationEnd() {
    this.loading = true;
    this.tableService.upsertColumn(this.columnData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.loading = false;
            this.columnOperationEnd.emit();
          },
          error: (error: any) => {
            this.loading = false;
            console.log(error);
          }
        }
      );
  }

}
