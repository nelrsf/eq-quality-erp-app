import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../components/layout/layout.module';
import { LayoutComponent } from './layout/layout.component';
import { MenuComponent } from '../components/menu/menu.component';
import { DataTableComponent } from '../components/crud/data-table/data-table.component';
import { ModulesComponent } from './modules/modules.component';
import { TablesComponent } from './tables/tables.component';
import { ParamGuard } from '../helpers/Param.guard';
import { LoadingComponent } from '../components/miscelaneous/loading/loading.component';
import { ColumnCustomizerComponent } from '../components/crud/column-customizer/column-customizer.component';
import { ButtonsPadComponent } from '../components/crud/buttons-pad/buttons-pad.component';
import { FormComponent } from '../components/crud/form/form.component';
import { GalleryViewComponent } from '../components/gallery-view/gallery-view.component';
import { ListViewerComponent } from '../components/list-viewer/list-viewer.component';
import { GridViewComponent } from '../components/grid-view/grid-view.component';
import { TablesSumaryComponent } from './tables-sumary/tables-sumary.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModuleCustomizerComponent } from '../components/module-customizer/module-customizer.component';
import { TableCustomizerComponent } from '../components/table-customizer/table-customizer.component';
import { ErrorComponent } from '../components/alerts/error/error.component';
import { AuthGuard } from '../helpers/Auth.guard';
import { AuthModule } from './auth/auth.module';
import { ErrorNotFoundComponent } from './error/404/error-page.component';
import { ErrorUnauthorizedPageComponent } from './error/401/error-unauthorized.component';
import { ApiDocsComponent } from './api-docs/api-docs.component';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { GridModuleViewComponent } from '../components/grid-module-view/grid-module-view.component';
import { SubtableComponent } from '../components/subtable/subtable.component';
import { MapsComponent } from '../components/maps/maps/maps.component';
import { PlugginGuard } from '../helpers/Pluggin.guard';





const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: ModulesComponent},
      {path: 'tables/:module/:route', component: TablesSumaryComponent, canActivate: [ParamGuard]},
      {path: 'form/:module/:table', component: FormComponent},
      {path: 'tables/:module', component: TablesSumaryComponent, canActivate: [ParamGuard]},
      {path: 'tables/auxdata/:objectdata', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'tables/data/:module/:table', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'images-gallery/:images', component: GalleryViewComponent, canActivate: [ParamGuard]},
      {path: 'list/:listData', component: ListViewerComponent, canActivate: [ParamGuard]},
      {path: 'subtable', component: SubtableComponent},
      {path: 'maps', component: MapsComponent, canActivate: [PlugginGuard], data: {type: 'maps'}},
      {path: 'error', component: ErrorNotFoundComponent},
      {path: 'unauthorized', component: ErrorUnauthorizedPageComponent},
      {path: 'docs', component: ApiDocsComponent},
      {path: '**', component: ErrorNotFoundComponent},
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [
    LayoutComponent,
    ModulesComponent,
    TablesComponent,
    TablesSumaryComponent,
    ErrorNotFoundComponent,
    ErrorUnauthorizedPageComponent,
    ApiDocsComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    MenuComponent,
    RouterModule.forChild(routes),
    DataTableComponent,
    LoadingComponent,
    ColumnCustomizerComponent,
    ButtonsPadComponent,
    FormComponent,
    GridViewComponent,
    GridModuleViewComponent,
    FormsModule,
    FontAwesomeModule,
    ErrorComponent,
    ModuleCustomizerComponent,
    TableCustomizerComponent,
    BreadcrumbComponent,
    AuthModule
  ],
  exports: [
    LayoutComponent,
    RouterModule
  ]
})
export class PagesModule { }
