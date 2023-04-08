import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataTableComponent, IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ModulesService } from './modules.service';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit, AfterViewInit {

  @ViewChild('createModule') createModule!: ElementRef;

  modules!: IModule[];
  newModuleName!: string;
  linkedFields: IMapAsUrl[] = [];
  loading: boolean = false;

  constructor(private modulesService: ModulesService, private cdRef: ChangeDetectorRef, private ngbModal: NgbModal) { }

  ngAfterViewInit(): void {
    this.getModulesData();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {

  }

  getModulesData() {
    this.loading = true;
    this.modulesService.getAllModules().subscribe(
      (data: any) => {
        this.modules = data;
        this.loading = false;
      }
    )
  }

  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  openCreateModal() {
    this.ngbModal.open(this.createModule)
  }

  createNewModule() {
    if (!this.newModuleName) {
      return;
    }
    this.closeModal();
    this.loading = true;
    this.modulesService.createModule(this.newModuleName)
    .subscribe(
      {
        next: (data:any)=>{
          this.modules = data;
          this.loading = false;
        }
      }
    );
  }

  getLinkFunction = (value: string | undefined) => {
    return "/tables/" + value;
  }

}

