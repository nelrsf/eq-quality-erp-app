import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'eq-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('modalSuccess') modalSuccess!: ElementRef;

  signupForm: FormGroup;
  submited: boolean = false;
  loading: boolean = false;

  errorMessage: string = "";
  successMessage: string = "";

  constructor(private authService: AuthService, private ngbModal: NgbModal, private router: Router) {
    this.signupForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      name: new FormControl("", Validators.required),
    })
  }
  ngOnInit(): void {

  }

  isInvalidField(field: string) {
    return this.signupForm.controls[field].status === 'INVALID' && this.submited;
  }

  onSubmit() {
    this.submited = true;
    if (this.signupForm.status == 'INVALID') {
      return;
    }
    this.loading = true;
    const name = this.signupForm.controls['name'].value;
    const email = this.signupForm.controls['email'].value;


    this.authService.signup(email, name)
      .subscribe(
        {
          next: (data: any) => {
            console.log(data)
            this.successMessage = data;
            this.ngbModal.open(this.modalSuccess);
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

}
