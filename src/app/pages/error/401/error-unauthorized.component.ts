import { Component } from '@angular/core';

@Component({
  selector: 'eq-error-unauthorized-page',
  templateUrl: './error-unauthorized.component.html',
  styleUrls: ['./error-unauthorized.component.css']
})
export class ErrorUnauthorizedPageComponent {

  status: string = "401";
  message: string = "Acceso no autorizado"

}
