import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { TablesService } from 'src/app/pages/tables/tables.service';

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
export class BreadcrumbComponent implements OnChanges, OnInit {

  @Input() mainRoute: string = "";
  @Input() module!: string;
  @Input() linkGetterFuntion!: (value: string | undefined, object?: any) => string

  constructor(private moduleService: ModulesService, private tableService: TablesService) {

  }

  icons = {
    home: faHome
  }

  moduleLabel!: string;
  labels: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['module']?.currentValue) {
      this.getModuleLabel();
    }
    if(changes['mainRoute']){
      this.getSegmentLabels();
    }
  }

  ngOnInit(): void {
    this.getSegmentLabels();
  }

  getSegmentLabels(){
    const segments = this.getRouteSegments();
    segments.forEach(
      (s)=>{
        this.getTableLabel(s);
      }
    )
  }

  getRouteSegments() {
    if (!this.mainRoute) {
      return [];
    }
    const segments = this.mainRoute.split('/').filter(s => s !== '');
    return segments;
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

  getTableLabel(tableName: string) {
    if (this.labels[tableName]) {
      return
    }
    this.tableService.getTableObjectMetadata(this.module, tableName)
      .subscribe(
        {
          next: (result: any) => {
            this.labels[tableName] = result?.table_metadata?.label;
          }
        }
      )
  }


}
