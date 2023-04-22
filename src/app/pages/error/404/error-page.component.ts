import { Component } from '@angular/core';

@Component({
  selector: 'eq-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorNotFoundComponent {

  status: string = "404";
  message: string = "El recurso solicitado no ha sido encontrado"

}
