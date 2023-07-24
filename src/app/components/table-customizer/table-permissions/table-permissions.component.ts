import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { permissionsColumns } from './table-permission-data';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../crud/data-table/data-table.component';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { ITable } from 'src/app/Model/interfaces/ITable';

@Component({
  selector: 'eq-table-permissions',
  templateUrl: './table-permissions.component.html',
  styleUrls: ['./table-permissions.component.css'],
  standalone: true,
  imports: [
    DataTableComponent,
    ErrorComponent,
    LoadingComponent,
    CommonModule
  ]
})
export class TablePermissionsComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild('modalError') modalError!: ElementRef;

  @Output() tableOperationEnd = new EventEmitter<ITable>();
  @Input() tableData!: ITable;
  @Input() module: string = "";

  public errorMessage: string = '';

  public loading: boolean = false;

  constructor(private tablesService: TablesService, private modulesService: ModulesService, private ngbModal: NgbModal) { }


  ngAfterViewInit(): void {
    this.tablesService.getAllRows(this.module, "__profiles_module_table__")
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
        if (this.tableData?.permissions?.read?.includes(item._id)) {
          item['Ver'] = true;
        } else {
          item['Ver'] = false;
        }

        if (this.tableData?.permissions?.edit?.includes(item._id)) {
          item['Editar'] = true;
        } else {
          item['Editar'] = false;
        }

        if (this.tableData?.permissions?.delete?.includes(item._id)) {
          item['Eliminar'] = true;
        } else {
          item['Eliminar'] = false;
        }
      }
    )
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  savePermissionsByItem(item: any) {
    let permissions = this.tableData?.permissions;
    permissions = {
      edit: permissions?.edit ? permissions.edit : [],
      read: permissions?.read ? permissions.read : [],
      delete: permissions?.delete ? permissions.delete : []
    }

    const edit = permissions.edit;
    const read = permissions.read;
    const deletePermissions = permissions.delete;
    if (item.Ver) {
      if (!read?.includes(item._id)) {
        read.push(item._id);
      };
    } else {
      const indx = read?.findIndex(r => r == item._id);
      if (indx > -1) {
        read.splice(indx, 1);
      }
    }
    if (item.Editar) {
      if (!edit?.includes(item._id)) {
        edit.push(item._id);
      }
    } else {
      const indx = edit?.findIndex(e => e == item._id);
      if (indx > -1) {
        edit.splice(indx, 1);
      }
    }
    if (item.Eliminar) {
      if (!deletePermissions?.includes(item._id)) {
        deletePermissions.push(item._id);
      }
    } else {
      const indx = deletePermissions?.findIndex(e => e == item._id);
      if (indx > -1) {
        deletePermissions.splice(indx, 1);
      }
    }
    this.tableData.permissions = permissions;
  }

  savePermissions() {
    this.loading = true;
    const data = this.dataTable.data.getValue();
    if (!this.tableData?.permissions) {
      this.tableData.permissions = {
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

    this.tablesService.customizeTable(this.module, this.tableData)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data);
            this.loading = false;
            this.tableOperationEnd.emit(this.tableData);
          },
          error: (error: any) => {
            this.loading = false;
            console.log(error);
          }
        }
      )
  }

}
