import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { MenuService } from './menu.service';
import { SubmenuComponent } from './submenu/submenu.component';
import { Module } from 'src/app/Model/entities/Module';
import { ModulesFactory } from 'src/app/pages/modules/modulesFactory';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'eq-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SubmenuComponent,
    FontAwesomeModule
  ]
})
export class MenuComponent implements OnInit {

  modules!: Module[];
  modulesFactory: ModulesFactory = new ModulesFactory();

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getModules().subscribe(
      (modulesTables: any) => {
        this.modules = this.modulesFactory.convertManyEntities(modulesTables);
      }
    );
  }

  collapseModule(collapsible: any){
    collapsible.classList.toggle("show")
  }

}
