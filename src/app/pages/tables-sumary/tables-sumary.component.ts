import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { TablesService } from '../tables/tables.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { PermissionsService } from 'src/app/services/permissions.service';
import { buttonType } from 'src/app/components/crud/buttons-pad/buttons-pad.component';
import { UserService } from 'src/app/services/user.service';
import { IUser } from 'src/app/Model/interfaces/IUser';

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
  confirmDeleteTableText!: string;
  currentTable!: string;
  data!: ITable[];
  tableData!: ITable;
  mainRoute: string = "";
  errorMessage!: string;
  buttonsList: buttonType[] = [];

  newTableName!: string;

  private unsubscribeAll = new Subject<void>();

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

  setButtonsFunctions(module: string) {
    const subscriberCallback = () => {
      if (!this.buttonsList.includes('add')) {
        this.buttonsList.push('add');
      }
      if (!this.buttonsList.includes('add-folder')) {
        this.buttonsList.push('add-folder');
      }
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
          this.data = result;
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
          this.data = result;
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
            this.data = data;
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
    if (this.ngbModal.hasOpenModals()) {
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
            this.data = data;
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


  openDeleteModal(table: string) {
    this.currentTable = table;
    this.confirmDeleteTableText = "";
    this.ngbModal.open(this.deleteTable);
  }

  openCustomizerTable(table: ITable) {
    this.tableData = table;
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
    this.tableService.deleteTable(this.module, this.currentTable)
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
}
