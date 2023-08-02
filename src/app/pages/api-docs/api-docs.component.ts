import { Component } from '@angular/core';
import { docsData } from './docs-data';

@Component({
  selector: 'eq-api-docs',
  templateUrl: './api-docs.component.html',
  styleUrls: ['./api-docs.component.css']
})
export class ApiDocsComponent {

  public docsData = docsData;

}
