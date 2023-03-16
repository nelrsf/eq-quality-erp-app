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
import { ColumnCustomizerPageComponent } from './column-customizer/column-customizer.component';


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
      {path: 'tables/:module', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'tables/auxdata/:objectdata', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'tables/data/:module/:table', component: TablesComponent, canActivate: [ParamGuard]},
      {path: 'columns/:module/:table/:columndata', component: ColumnCustomizerComponent, canActivate: [ParamGuard]},
    ]
  }
];

@NgModule({
  declarations: [
    LoginComponent,
    LayoutComponent,
    ModulesComponent,
    TablesComponent,
    ColumnCustomizerPageComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    MenuComponent,
    RouterModule.forChild(routes),
    DataTableComponent,
    HttpClientModule,
    LoadingComponent,
    ColumnCustomizerComponent
  ],
  exports: [
    LoginComponent,
    LayoutComponent,
    RouterModule
  ]
})
export class PagesModule { }
