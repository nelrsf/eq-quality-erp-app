import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule
  ]
})
export class SuccessComponent implements AfterViewInit {


  @ViewChild('timmerBar') timmerBar!: ElementRef;

  @Input() message!: string;
  @Input() linkMessage!: string;
  @Input() link!: string;
  @Input() timmer!: number;
  @Input() timmerFunction: () => void = () => { };
  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter();

  icons = {
    success: faCheckCircle
  }


  ngAfterViewInit(): void {
    if (this.timmer) {
      setTimeout(
        ()=>{
          this.timmerBar.nativeElement.style.width = '0';
        }
      )
      setTimeout(
        () => {
          this.timeOutFunction();
        }
        , this.timmer * 1000)
    }
  }

  closeModal() {
    this.close.emit();
  }

  submitModal() {
    this.submit.emit();
  }

  timeOutFunction() {
    this.timmerFunction();
    this.closeModal();
  }

}
