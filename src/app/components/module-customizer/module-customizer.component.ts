import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'eq-module-customizer',
  templateUrl: './module-customizer.component.html',
  styleUrls: ['./module-customizer.component.css'],
  standalone: true,
  imports: [
    LoadingComponent,
    FormsModule,
    CommonModule
  ]
})
export class ModuleCustomizerComponent {

  @Input() moduleData!: IModule;
  @Output() moduleDataChange = new EventEmitter<IModule>();

  onSubmit(){
    this.moduleDataChange.emit(this.moduleData);
  }

}
