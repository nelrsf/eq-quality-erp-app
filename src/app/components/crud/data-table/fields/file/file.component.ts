import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'eq-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class FileComponent {

  @Input() value!: string;
  @Output() valueChange = new EventEmitter<string>();

  onChange(event: any){
    this.valueChange.emit(event.target.value)
  }

}
