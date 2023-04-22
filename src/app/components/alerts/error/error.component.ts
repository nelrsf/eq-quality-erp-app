import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule
  ]
})
export class ErrorComponent {

  @Input() errorMessage!: string;
  @Output() close = new EventEmitter();

  icons = {
    error: faExclamationTriangle
  }

  closeModal(){
    this.close.emit();
  }

}
