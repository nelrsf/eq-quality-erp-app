import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { MenuService } from './menu.service';

@Component({
  selector: 'eq-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class MenuComponent implements OnInit {

  modules!: IModule[];

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getModules().subscribe(
      (modulesTables: any) => {
        this.modules = modulesTables;
      }
    );
  }

  collapseModule(collapsible: any){
    collapsible.classList.toggle("show")
  }

}
