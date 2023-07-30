import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { permissionsColumns } from './module-permission-data';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../crud/data-table/data-table.component';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-module-permissions',
  templateUrl: './module-permissions.component.html',
  styleUrls: ['./module-permissions.component.css'],
  standalone: true,
  imports: [
    DataTableComponent,
    ErrorComponent,
    LoadingComponent,
    CommonModule
  ]
})
export class ModulePermissionsComponent implements AfterViewInit {

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild('modalError') modalError!: ElementRef;

  @Output() moduleOperationEnd = new EventEmitter<IModule>();
  @Input() moduleData!: IModule;

  public errorMessage: string = '';

  public loading: boolean = false;

  constructor(private tablesService: TablesService, private modulesService: ModulesService, private ngbModal: NgbModal) { }


  ngAfterViewInit(): void {
    this.tablesService.getAllRows(this.moduleData.name, environment.adminTables.profile)
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
        if (this.moduleData?.permissions?.read?.includes(item._id)) {
          item['Ver'] = true;
        } else {
          item['Ver'] = false;
        }

        if (this.moduleData?.permissions?.edit?.includes(item._id)) {
          item['Editar'] = true;
        } else {
          item['Editar'] = false;
        }

        if (this.moduleData?.permissions?.delete?.includes(item._id)) {
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
    const edit = this.moduleData.permissions.edit;
    const read = this.moduleData.permissions.read;
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
  }

  savePermissions() {
    this.loading = true;
    const data = this.dataTable.data.getValue();
      this.moduleData.permissions = {
        edit: this.moduleData?.permissions?.edit ? this.moduleData.permissions.edit : [],
        read: this.moduleData?.permissions?.read ? this.moduleData.permissions.read : [],
        delete: this.moduleData?.permissions?.delete ? this.moduleData.permissions.delete : [],
      }
    data.forEach(
      (item: any) => {
        this.savePermissionsByItem(item);
      }
    );

    this.modulesService.customizeModule(this.moduleData)
      .subscribe(
        {
          next: (data: any) => {
            this.loading = false;
            this.moduleOperationEnd.emit(this.moduleData);
          },
          error: (error: any) => {
            this.loading = false;
            console.log(error);
          }
        }
      )
  }

}
