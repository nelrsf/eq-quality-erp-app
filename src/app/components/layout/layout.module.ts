import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MenuComponent } from '../menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { PageRendererComponent } from './page-renderer/page-renderer/page-renderer.component';
import { PageRendererDirective } from './page-renderer/page-renderer.directive';



@NgModule({
  declarations: [
    SideBarComponent,
    NavBarComponent,
    FooterComponent,
    PageRendererComponent,
    PageRendererDirective
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SideBarComponent,
    NavBarComponent,
    FooterComponent,
    PageRendererComponent
  ]
})
export class LayoutModule { }
