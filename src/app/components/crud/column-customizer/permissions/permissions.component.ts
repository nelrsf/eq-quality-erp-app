import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DataTableComponent } from '../../data-table/data-table.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { permissionsColumns } from './permission-data';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
  standalone: true,
  imports: [
    DataTableComponent,
    ErrorComponent
  ]
})
export class PermissionsComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild('modalError') modalError!: ElementRef;
  @Input() columnData!: IColumn;
  
  public errorMessage: string = '';

  constructor(private tablesService: TablesService, private ngbModal: NgbModal) { }


  ngAfterViewInit(): void {
    this.tablesService.getAllRows(this.columnData.module, "__profiles_module_table__")
    .subscribe(
      {
        next: (result: any)=>{
          this.dataTable.data.next(result);
        },
        error: (error)=>{
          console.log(error);
          this.errorMessage = error.message;
          this.ngbModal.open(this.modalError);
        }
      }
    )

    this.dataTable.columnsSubject.next(permissionsColumns)
  }

  closeModal(){
    this.ngbModal.dismissAll();
  }

}
