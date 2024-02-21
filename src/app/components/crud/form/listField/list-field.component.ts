import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-list-field',
  templateUrl: './list-field.component.html',
  styleUrls: ['./list-field.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule
  ]
})
export class ListFieldComponent {

  @Input() listData: Array<any> = [];
  @Input() editable: boolean = true;
  @Output() listDataChange = new EventEmitter<Array<any>>();

  icons = {
    add: faPlus,
    delete: faTrash
  }

  newItem: string = "";

  addItem(event: Event) {
    event.preventDefault();
    this.listData.unshift(this.newItem)
    this.newItem = "";
  }

  deleteItem(event: Event, i: number) { 
    event.preventDefault();
    this.listData.splice(i, 1);
   }

}
