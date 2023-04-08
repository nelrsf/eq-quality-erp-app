import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnTypes } from 'src/app/Model/interfaces/IColumn';

@Component({
  selector: 'eq-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class ListComponent {

  constructor(private router: Router){}

  @Input() value!: Array<any>;
  @Output() valueChange = new EventEmitter<Array<any>>();
  @Output() openModal = new EventEmitter<ColumnTypes>();

  onChange(event: any){
    this.valueChange.emit(event.target.value)
  }

  viewList(){
    this.openModal.emit(ColumnTypes.list);
  }

}
