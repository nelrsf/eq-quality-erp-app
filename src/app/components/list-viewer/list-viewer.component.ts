import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-list-viewer',
  templateUrl: './list-viewer.component.html',
  styleUrls: ['./list-viewer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule
  ]
})
export class ListViewerComponent implements OnInit {

  @Input() listData: Array<any> = [];
  @Output() listDataChange = new EventEmitter<Array<any>>();

  icons = {
    add: faPlus,
    delete: faTrash
  }

  newItem: string = "";

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if(!this.listData){
      this.listData = [];
    }
  }


  addItem(event: Event) {
    event.preventDefault();
    this.listData.unshift(this.newItem)
    this.newItem = "";
  }

  deleteItem(event: Event, i: number) {
    event.preventDefault();
    this.listData.splice(i, 1);
  }

  onSubmit(){
    this.listDataChange.emit(this.listData);
  }

}
