import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingComponent } from '../../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IModule } from 'src/app/Model/interfaces/IModule';

@Component({
  selector: 'eq-module-customizer-general',
  templateUrl: './module-customizer-general.component.html',
  styleUrls: ['./module-customizer-general.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule
  ]
})
export class ModuleCustomizerGeneralComponent {

  @Input() moduleData!: IModule;
  @Output() moduleDataChange = new EventEmitter<IModule>();

  onSubmit(){
    this.moduleDataChange.emit(this.moduleData);
  }

}
