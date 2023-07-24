import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableComponent } from '../../data-table/data-table.component';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { permissionsColumns } from './permission-data';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'eq-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
  standalone: true,
  imports: [
    DataTableComponent,
    ErrorComponent,
    LoadingComponent,
    CommonModule
  ]
})
export class PermissionsComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild('modalError') modalError!: ElementRef;

  @Output() columnOperationEnd = new EventEmitter<void>();
  @Input() columnData!: IColumn;

  public errorMessage: string = '';

  public loading: boolean = false;

  constructor(private tablesService: TablesService, private ngbModal: NgbModal) { }


  ngAfterViewInit(): void {
    this.tablesService.getAllRows(this.columnData.module, "__profiles_module_table__")
      .subscribe(
        {
          next: (result: any) => {
            this.checkPermissions(result);
            this.dataTable.data.next(result);
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = error.message;
            this.ngbModal.open(this.modalError);
          }
        }
      )

    this.dataTable.columnsSubject.next(permissionsColumns)
  }

  checkPermissions(data: Array<any>) {
    data.forEach(
      (item: any) => {
        if (this.columnData?.permissions?.read.includes(item._id)) {
          item['Ver'] = true;
        } else {
          item['Ver'] = false;
        }

        if (this.columnData?.permissions?.edit.includes(item._id)) {
          item['Editar'] = true;
        } else {
          item['Editar'] = false;
        }
      }
    )
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  savePermissionsByItem(item: any) {
    const edit = this.columnData.permissions.edit;
    const read = this.columnData.permissions.read;
    if (item.Ver) {
      if (!read.includes(item._id)) {
        read.push(item._id);
      };
    } else {
      const indx = read.findIndex(r => r == item._id);
      if (indx > -1) {
        read.splice(indx, 1);
      }
    }
    if (item.Editar) {
      if (!this.columnData.permissions.edit.includes(item._id)) {
        this.columnData.permissions.edit.push(item._id);
      }
    } else {
      const indx = edit.findIndex(e => e == item._id);
      if (indx > -1) {
        edit.splice(indx, 1);
      }
    }
  }

  savePermissions() {
    this.loading = true;
    const data = this.dataTable.data.getValue();
    if (!this.columnData.permissions) {
      this.columnData.permissions = {
        edit: [],
        read: [],
        delete: []
      }
    }
    data.forEach(
      (item: any) => {
        this.savePermissionsByItem(item);
      }
    );

    this.tablesService.upsertColumn(this.columnData)
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
      )
  }

}
