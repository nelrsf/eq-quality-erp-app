import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'eq-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('modalSuccess') modalSuccess!: ElementRef;
  @ViewChild('changePassword') changePassword!: ElementRef;
  @ViewChild('modalInput') modalInput!: ElementRef;
  

  icons = {
    show: faEye
  }

  inputData = {
    title: "Recuperación de contraseña",
    message: "Ingresa tu e-mail para recuperar tu contraseña",
    label: "E-mail"
  }

  private loginForm: FormGroup;

  submited: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
  showPassword:boolean = false;
  firstTimeChangePassword: boolean = true; 

  constructor(private authService: AuthService, private ngbModal: NgbModal, private router: Router, private http: HttpClient, private userService: UserService) {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required]),
    })
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if(token){
      this.router.navigate(['/']);
    }

  }

  public getForm(): FormGroup {
    return this.loginForm;
  }

  isInvalidField(field: string) {
    return this.loginForm.controls[field].status === 'INVALID' && this.submited;
  }

  onSubmit() {
    this.submited = true;
    if (this.loginForm.status == 'INVALID') {
      return;
    }
    this.loading = true;
    const password = this.loginForm.controls['password'].value;
    const email = this.loginForm.controls['email'].value;


    this.authService.login(email, password)
      .subscribe(
        {
          next: (data: any) => {
            if(data?.firstTime){
              this.firstTimeChangePassword = data.firstTime;
              this.ngbModal.open(this.changePassword)
              this.loading = false;
              return;
            }
            this.authService.setToken(data.token);
            this.userService.setUser({
              _id: data._id,
              email: data.email,
              name: data.name,
              image: data.image ? data.image : 'https://bootdey.com/img/Content/avatar/avatar7.png'
            })
            this.router.navigate(['/']);
            this.loading = false;
          },
          error: (response: any) => {
            console.log(response);
            this.errorMessage = response?.error ? response?.error : response;
            this.ngbModal.open(this.modalError);
            this.loading = false;
          }
        }
      )
  }

  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  submitChangePswModal(){
    this.loading = true;
  }

  changePaswFailed(message: any){
    this.errorMessage = message;
    this.loading = false;
    this.ngbModal.open(this.modalError);
  }

  changePaswSuccess(message: any){
    this.successMessage = message;
    this.loading = false;
    this.closeModal();
    this.ngbModal.open(this.modalSuccess);
  }

  openInputModal(){
    this.loading = false;
    this.ngbModal.open(this.modalInput);
  }

  sendRecoveryPasswordEmail(event: string){
    this.closeModal();
    this.loading = true;
    this.authService.sendRecoveryCode(event)
    .subscribe(
      {
        next: ()=>{
          this.successMessage = `Se ha enviado un enlace de recuperación al correo ${event}`;
          this.ngbModal.open(this.modalSuccess);
          this.loading = false;
        },
        error: (error)=>{
          this.errorMessage = error?.error ? error.error : '';
          this.loading = false;
          this.ngbModal.open(this.modalError);
        }
      }
    )
  }

}
