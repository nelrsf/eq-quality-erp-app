import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleCustomizerGeneralComponent } from './module-customizer-general/module-customizer-general.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsComponent } from '../crud/column-customizer/permissions/permissions.component';
import { ModulePermissionsComponent } from './module-permissions/module-permissions.component';

@Component({
  selector: 'eq-module-customizer',
  templateUrl: './module-customizer.component.html',
  styleUrls: ['./module-customizer.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule,
    ModuleCustomizerGeneralComponent,
    NgbNavModule,
    ModulePermissionsComponent
  ]
})
export class ModuleCustomizerComponent {

  @Input() moduleData!: IModule;
  @Output() moduleDataChange = new EventEmitter<IModule>();


  onModuleCustomize(module: IModule){
    this.moduleDataChange.emit(this.moduleData);
  }

}
