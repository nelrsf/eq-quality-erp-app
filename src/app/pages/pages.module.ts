import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../components/layout/layout.module';
import { LayoutComponent } from './layout/layout.component';
import { MenuComponent } from '../components/menu/menu.component';
import { DataTableComponent } from '../components/crud/data-table/data-table.component';
import { ModulesComponent } from './modules/modules.component';
import { HttpClientModule } from '@angular/common/http';
import { TablesComponent } from './tables/tables.component';
import { ParamGuard } from '../helpers/Param.guard';
import { LoadingComponent } from '../components/miscelaneous/loading/loading.component';
import { ColumnCustomizerComponent } from '../components/crud/column-customizer/column-customizer.component';
import { ButtonsPadComponent } from '../components/crud/buttons-pad/buttons-pad.component';
import { FormComponent } from '../components/crud/form/form.component';
import { DragDirective } from '../directives/drag.directive';
import { DropTargetDirective } from '../directives/drop-target.directive';
import { GalleryViewComponent } from '../components/gallery-view/gallery-view.component';
import { ListFieldComponent } from '../components/crud/form/listField/list-field.component';
import { ListViewerComponent } from '../components/list-viewer/list-viewer.component';
import { GridViewComponent } from '../components/grid-view/grid-view.component';
import { TablesSumaryComponent } from './tables-sumary/tables-sumary.component';
import { FormsModule } from '@angular/forms';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: ModulesComponent},
      {path: 'tables/:module', component: TablesSumaryComponent, canActivate: [ParamGuard]},
      {path: 'tables/auxdata/:objectdata', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'tables/data/:module/:table', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'images-gallery/:images', component: GalleryViewComponent, canActivate: [ParamGuard]},
      {path: 'list/:listData', component: ListViewerComponent, canActivate: [ParamGuard]},
    ]
  }
];

@NgModule({
  declarations: [
    LoginComponent,
    LayoutComponent,
    ModulesComponent,
    TablesComponent,
    TablesSumaryComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    MenuComponent,
    RouterModule.forChild(routes),
    DataTableComponent,
    HttpClientModule,
    LoadingComponent,
    ColumnCustomizerComponent,
    ButtonsPadComponent,
    FormComponent,
    GridViewComponent,
    FormsModule
  ],
  exports: [
    LoginComponent,
    LayoutComponent,
    RouterModule
  ]
})
export class PagesModule { }
