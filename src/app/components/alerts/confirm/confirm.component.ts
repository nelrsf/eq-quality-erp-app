import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

export const EQ_CONFIRM_MODAL_YES = 0;
export const EQ_CONFIRM_MODAL_NO = 1;

@Component({
  selector: 'eq-confirm-dialog',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    FormsModule
  ]
})
export class ConfirmDialogComponent {

  @Input() message!: string;
  @Input() title!: string;
  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter();


  icons = {
    success: faQuestionCircle
  }

  closeModal() {
    this.close.emit();
  }

  submitYes(event: any){
    this.submit.emit(EQ_CONFIRM_MODAL_YES);
    this.closeModal();
  }

  submitNo(event: any){
    this.submit.emit(EQ_CONFIRM_MODAL_NO);
    this.closeModal();
  }

}
