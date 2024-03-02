import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ITable, TableModes } from 'src/app/Model/interfaces/ITable';
import { TablesService } from '../tables/tables.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { PermissionsService } from 'src/app/services/permissions.service';
import { UserService } from 'src/app/services/user.service';
import { IUser } from 'src/app/Model/interfaces/IUser';
import { buttonType } from 'src/app/components/crud/buttons-pad/Ibutton';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { faFolder, faMapLocationDot, faTable } from '@fortawesome/free-solid-svg-icons';
import { faWpforms } from '@fortawesome/free-brands-svg-icons';
import { Form, Table } from 'src/app/Model/entities/Table';
import { TablesFactory } from './tables-factory';
import { Module } from 'src/app/Model/entities/Module';

@Component({
  selector: 'eq-tables-sumary',
  templateUrl: './tables-sumary.component.html',
  styleUrls: ['./tables-sumary.component.css']
})
export class TablesSumaryComponent implements OnInit, OnDestroy {

  @ViewChild('createTable') createTable!: ElementRef;
  @ViewChild('deleteTable') deleteTable!: ElementRef;
  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('customizeTable') customizeTable!: ElementRef;
  @ViewChild('createFolder') createFolder!: ElementRef;

  module!: string;
  route!: string;
  loading: boolean = false;
  newFolderName!: string;
  newEntity!: Table;
  confirmDeleteTableText!: string;
  currentTable!: string;
  data!: Table[];
  tableData!: ITable;
  mainRoute: string = "";
  errorMessage!: string;
  buttonsList: buttonType[] = [];
  tableViewMode!: TableModes;
  newTableName!: string;
  tablesFactory: TablesFactory = new TablesFactory();


  icons = {
    table: faTable,
    form: faWpforms,
    map: faMapLocationDot,
    folder: faFolder
  }

  private unsubscribeAll = new Subject<void>();
  private currentTableId!: string;

  constructor(private activatedRoute: ActivatedRoute, private tableService: TablesService, private ngbModal: NgbModal, private permissionsService: PermissionsService, private userService: UserService) { }


  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.getDataFromServer(params);
      this.initializePermissions();
    })
  }

  initializePermissions() {
    this.userService.getUserSubject()
      .subscribe(
        (_user: IUser | null) => {
          this.setButtonsFunctions(this.module);
        }
      )
  }


  addButtonIfDoesntExist(buttonTag: buttonType) {
    if (!this.buttonsList.includes(buttonTag)) {
      this.buttonsList.push(buttonTag);
    }
  }

  setButtonsFunctions(module: string) {
    const subscriberCallback = () => {
      this.addButtonIfDoesntExist('add-entity');
      this.addButtonIfDoesntExist('add');
      this.addButtonIfDoesntExist('add-folder');
    }

    this.permissionsService.canEditTable(module, this.route)
      .subscribe({
        next: (canEdit: boolean) => {
          if (canEdit) {
            subscriberCallback();
          }
        }
      });

    this.permissionsService.canEdit(module)
      .subscribe({
        next: (canEdit: boolean) => {
          if (canEdit) {
            subscriberCallback();
          }
        }
      });

    this.permissionsService.isOwner(module)
      .subscribe({
        next: (isOwner: boolean) => {
          if (isOwner) {
            subscriberCallback();
          }
        }
      })
  }


  getDataFromServer(params: any,) {
    this.module = params['module'];
    this.route = params['route'];
    if (this.module && this.route) {
      this.getTableDataByRoute(this.module, this.route);
      return true;
    }
    if (this.module) {
      this.getTableData(this.module);
      return true;
    }
    return false;
  }


  getTableDataByRoute(module: string, route: string) {
    this.loading = true;
    this.tableService.getTablesByRoute(module, route).subscribe(
      {
        next: (result: any) => {
          this.data = this.tablesFactory.convertManyEntities(result);
          if (this.data.length > 0) {
            this.mainRoute = this.data[0].route ? this.data[0].route : '';
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error;
          this.openErrorModal();
          console.log(error);
        }
      }
    )
  }


  getTableData(module: string) {
    this.loading = true;
    this.tableService.getAllTables(module).subscribe(
      {
        next: (result: any) => {
          this.data = this.tablesFactory.convertManyEntities(result);;
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.message ? error.message : 'Error desconocido';
          this.openErrorModal();
          console.log(error);
        }
      }
    )
  }


  openCreateFolder() {
    this.ngbModal.open(this.createFolder);
  }

  openCreateEntity(viewMode: TableModes) {
    this.tableViewMode = viewMode;
    const enityType = this.tablesFactory.entities.get(viewMode);
    if (enityType) {
      this.newEntity = new enityType();
      this.newEntity.viewMode = viewMode;
      const modalRef = this.ngbModal.open(this.newEntity.customizeViewComponent);
      modalRef.componentInstance.newEntity = this.newEntity;
      modalRef.componentInstance.newEntityChange.subscribe((ne: Table) => this.newEntity = ne);
      modalRef.componentInstance.createNewEntity.subscribe(() => { this.createNewEntity() });
      modalRef.componentInstance.closeModal.subscribe(() => { modalRef.close() });
    }
  }

  createNewEntity() {
    if (!this.newEntity || !this.newEntity?.name) {
      return;
    }
    this.closeModal();
    this.loading = true;
    this.tableService.createTable(this.module, this.newEntity.name, this.route, this.newEntity)
      .subscribe(
        {
          next: (data: any) => {
            this.data = this.tablesFactory.convertManyEntities(data);
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.message ? error.message : 'Error desconocido';
            this.openErrorModal();
            console.log(error);
          }
        }
      );
  }

  createNewFolder() {
    if (!this.newFolderName) {
      return;
    }
    this.closeModal();
    this.loading = true;
    this.tableService.createFolder(this.module, this.newFolderName, this.route)
      .subscribe(
        {
          next: (data: any) => {
            this.data = this.tablesFactory.convertManyEntities(data);
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.message ? error.message : 'Error desconocido';
            this.openErrorModal();
            console.log(error);
          }
        }
      );
  }

  getLinkFunction = (value: string | undefined, item?: any) => {
    return this.tableService.getLinkFunction(value, this.module, item);
  }

  closeModal() {
    if (this.ngbModal?.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  createNewTable() {
    if (!this.newTableName) {
      return;
    }
    this.closeModal();
    this.loading = true;
    this.tableService.createTable(this.module, this.newTableName, this.route)
      .subscribe(
        {
          next: (data: any) => {
            this.data = this.tablesFactory.convertManyEntities(data);
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.message ? error.message : 'Error desconocido';
            this.openErrorModal();
            console.log(error);
          }
        }
      );
  }

  openErrorModal() {
    this.ngbModal.open(this.modalError);
  }

  openCreateModal() {
    this.ngbModal.open(this.createTable);
  }


  openDeleteModal(table: ITable | IModule) {
    this.currentTable = table?.label ? table.label : 'Eliminar tabla';
    this.currentTableId = table?.name ? table?.name : '';
    this.confirmDeleteTableText = "";
    this.ngbModal.open(this.deleteTable);
  }

  openCustomizerTable(table: ITable | IModule) {
    this.tableData = table as ITable;
    this.ngbModal.open(this.customizeTable, { size: 'xl' });
  }

  onCustomizeTable(table: ITable) {
    this.closeModal();
    this.tableService.customizeTable(this.module, table)
      .subscribe(
        {
          next: (response) => {
            console.log(response)
            const params = { module: this.module, route: this.route };
            this.getDataFromServer(params);
          },
          error: (error) => {
            console.log(error)
          }
        })
  }

  deleteCurrentTable() {
    this.closeModal();
    this.tableService.deleteTable(this.module, this.currentTableId)
      .subscribe(
        {
          next: (response) => {
            console.log(response)
            const segments = this.mainRoute.split('/');
            let lastSegment;
            if (segments.length > 0) {
              lastSegment = segments[segments.length - 1];
            } else {
              lastSegment = '/';
            }

            this.getTableDataByRoute(this.module, lastSegment);
          },
          error: (error) => {
            console.log(error)
          }
        }
      );
  }

  // getIcon(table: ITable) {
  //   if (table.isFolder) {
  //     return this.icons.folder;
  //   } else if (table?.viewMode === 'form') {
  //     return this.icons.form;
  //   } else if (table.viewMode === 'map') {
  //     return this.icons.map;
  //   } else {
  //     return this.icons.table;
  //   }
  // }
}
