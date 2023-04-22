import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { TablesService } from '../tables/tables.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-tables-sumary',
  templateUrl: './tables-sumary.component.html',
  styleUrls: ['./tables-sumary.component.css']
})
export class TablesSumaryComponent implements OnInit {

  @ViewChild('createTable') createTable!: ElementRef;
  @ViewChild('deleteTable') deleteTable!: ElementRef;
  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('customizeTable') customizeTable!: ElementRef;

  module!: string;
  loading: boolean = false;
  confirmDeleteTableText!: string;
  currentTable!: string;
  data!: ITable[];
  tableData!: ITable;
  errorMessage!: string;

  newTableName!: string;

  constructor(private activatedRoute: ActivatedRoute, private tableService: TablesService, private ngbModal: NgbModal) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.getDataFromServer(params);
    })
  }

  getDataFromServer(params: any,) {
    this.module = params['module'];
    if (this.module) {
      this.getTableData(this.module);
      return true;
    }
    return false;
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
          console.error(error);
          this.loading = false;
        }
      }
    )
  }

  getLinkFunction = (value: string | undefined) => {
    return "/tables/data/" + this.module + "/" + value;
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
    this.tableService.createTable(this.module, this.newTableName)
      .subscribe(
        {
          next: (data: any) => {
            this.data = data;
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.error;
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
    this.ngbModal.open(this.customizeTable);
  }

  onCustomizeTable(table: ITable) {
    this.closeModal();
    this.tableService.customizeTable(this.module, table)
      .subscribe(
        {
          next: (response) => {
            console.log(response)
            this.getTableData(this.module);
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
            this.getTableData(this.module);
          },
          error: (error) => {
            console.log(error)
          }
        }
      );
  }
}
