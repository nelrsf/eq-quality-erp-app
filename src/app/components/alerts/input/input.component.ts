import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'eq-alert-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    FormsModule
  ]
})
export class AlertInputComponent {

  @Input() message!: string;
  @Input() title!: string;
  @Input() label!: string;
  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter();

  value: string = "";

  icons = {
    success: faCheckCircle
  }

  closeModal() {
    this.close.emit();
  }

  submitModal(event: any){
    this.submit.emit(this.value);
    this.closeModal();
  }

}
