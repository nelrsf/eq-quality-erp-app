import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { ModulesService } from 'src/app/pages/modules/modules.service';

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
export class BreadcrumbComponent implements OnChanges {

  @Input() mainRoute: string = "";
  @Input() module!: string;
  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  constructor(private moduleService: ModulesService) {

  }


  icons = {
    home: faHome
  }

  moduleLabel!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['module']?.currentValue) {
      this.getModuleLabel();
    }
  }

  getRouteSegments() {
    if (!this.mainRoute) {
      return [];
    }
    return this.mainRoute.split('/').filter(s => s !== '');
  }

  getModuleLabel() {
    this.moduleService.getModuleByName(this.module)
      .subscribe(
        {
          next: (result: any) => {
            this.moduleLabel = result?.label;
          }
        }
      )
  }


}
