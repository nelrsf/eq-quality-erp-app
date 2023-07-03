import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from 'src/app/components/alerts/error/error.component';
import { LoadingComponent } from 'src/app/components/miscelaneous/loading/loading.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SuccessComponent } from 'src/app/components/alerts/success/success.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { AlertInputComponent } from 'src/app/components/alerts/input/input.component';
import { LayoutComponent } from '../layout/layout.component';
import { LayoutModule } from "../../components/layout/layout.module";


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'recovery/:code',
    component: RecoverPasswordComponent
  }
]

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent,
        ChangePasswordComponent,
        RecoverPasswordComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        ReactiveFormsModule,
        ErrorComponent,
        SuccessComponent,
        AlertInputComponent,
        LoadingComponent,
        FontAwesomeModule,
        LayoutModule
    ]
})
export class AuthModule { }
