import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IMapAsUrl } from 'src/app/components/crud/data-table/data-table.component';
import { ModulesService } from './modules.service';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { Module } from 'src/app/Model/entities/Module';
import { ModulesFactory } from './modulesFactory';


@Component({
  selector: 'eq-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit, AfterViewInit {

  @ViewChild('createModule') createModule!: ElementRef;
  @ViewChild('deleteModule') deleteModule!: ElementRef;
  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('customizeModule') customizeModule!: ElementRef;


  modules!: Module[];
  newModuleName!: string;
  confirmDeleteModuleText!: string;
  currentModule!: Module;
  linkedFields: IMapAsUrl[] = [];
  loading: boolean = false;
  errorMessage!: string;
  moduleData!: Module;
  modulesFactory: ModulesFactory = new ModulesFactory();


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
      {
        next: (data: any) => {
          this.modules = this.modulesFactory.convertManyEntities(data);
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
          this.loading = false;
          this.errorMessage = error.message;
          this.openErrorModal();
        }
      }
    )
  }

  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  openCreateModal() {
    this.ngbModal.open(this.createModule);
  }


  openConfigModal(module: IModule | ITable) {
    this.moduleData = module as IModule;
    this.ngbModal.open(this.customizeModule, { size: 'xl' });
  }

  onModuleCustomize(module: IModule) {
    this.closeModal();
    this.loading = true;
    this.modulesService.customizeModule(module)
      .subscribe({
        next: (result: any) => {
          console.log(result);
          this.getModulesData();
          this.loading = false;
        },
        error: (error: any) => {
          console.log(error);
          this.loading = false;
          this.errorMessage = error.message;
          this.openErrorModal();
        }
      })
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
          next: (data: any) => {
            this.modules = this.modulesFactory.convertManyEntities(data);;
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

  openDeleteModal(module: IModule | ITable) {
    this.currentModule = (module as IModule);
    this.confirmDeleteModuleText = this.currentModule.label ? this.currentModule.label : 'Delete my module';
    this.ngbModal.open(this.deleteModule);
  }

  deleteCurrentModule() {
    this.closeModal();
    this.modulesService.deleteModule(this.currentModule.name)
      .subscribe(
        {
          next: (response) => {
            console.log(response);
            this.getModulesData();
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = error.error;
            this.openErrorModal();
          }
        }
      );

  }

  openErrorModal() {
    this.ngbModal.open(this.modalError);
  }

  getLinkFunction = (value: string | undefined) => {
    return "/tables/" + value + '/';
  }

}

