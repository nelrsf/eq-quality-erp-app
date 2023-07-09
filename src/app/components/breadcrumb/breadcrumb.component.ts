import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule
  ]
})
export class BreadcrumbComponent {

  @Input() mainRoute: string = "";
  @Input() module!: string;
  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  icons = {
    home: faHome
  }

  getRouteSegments(){
    if(!this.mainRoute){
      return [];
    }
    return this.mainRoute.split('/').filter(s=>s!=='');
  }

}
