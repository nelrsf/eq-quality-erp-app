import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faEye, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth.service';

@Component({
  selector: 'eq-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  @Input() firstTime: boolean = false;
  @Input() email!: string;
  @Input() recoveryCode!: string;
  @Input() padding: boolean = true;

  @Output() onFail: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSubmitModal: EventEmitter<void> = new EventEmitter<void>();

  changePswForm!: FormGroup;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;
  submited: boolean = false;
  icons = {
    show: faEye,
    x: faTimesCircle
  }


  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    const regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&@/])[a-zA-Z0-9!#$%&@/]{6,}$";
    this.changePswForm = new FormGroup({
      oldPassword: new FormControl("", this.getOldPasswordValidators()),
      newPassword: new FormControl("", [Validators.required, Validators.pattern(regexp)]),
      confirmNewPassword: new FormControl("", [Validators.required, Validators.pattern(regexp)]),
    })
  }

  isInvalidField(field: string) {
    return this.changePswForm.controls[field].status === 'INVALID' && this.submited;
  }

  private getOldPasswordValidators(){
    return this.recoveryCode ? [] : [Validators.required];
  }

  matchPattern(field: string): boolean {
    const errors = this.changePswForm.controls[field].errors;
    if (!errors) {
      return true;
    }
    const pattern = errors['pattern'];
    if (!pattern) {
      return true;
    }
    return false;
  }

  matchPasswords() {
    const newPassword = this.changePswForm.controls['newPassword'].value;
    const confirmPassword = this.changePswForm.controls['confirmNewPassword'].value;
    return newPassword === confirmPassword;
  }

  onSubmit() {
    this.submited = true;
    if (this.changePswForm.status === "INVALID") {
      return;
    }
    if (!this.matchPasswords()) {
      return;
    }
    this.onSubmitModal.emit();
    const newPassword = this.changePswForm.controls['newPassword'].value;
    const oldPassword = this.changePswForm.controls['oldPassword'].value;
    this.authService.changePassword(oldPassword, newPassword, this.email, this.recoveryCode)
      .subscribe(
        {
          next: (response: any) => {
            console.log(response)
            this.onSuccess.emit(response);
          },
          error: (error: any) => {
            const errorMessage = error?.error ? error?.error : error;
            this.onFail.emit(errorMessage);
          }
        }
      )
  }

}


