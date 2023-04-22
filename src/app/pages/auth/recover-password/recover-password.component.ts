import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {

  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('modalSuccess') modalSuccess!: ElementRef;

  errorMessage!: string;
  successMessage!: string;
  loading: boolean = false;

  error: boolean = false;
  expired: boolean = false;
  email!: string;
  recoveryCode!: string;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private ngbModal: NgbModal, private router: Router) { }


  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.recoveryCode = params['code'];
      try {
        const decoded = this.authService.decodeRecoverCode(this.recoveryCode);
        const payload = JSON.parse(decoded);
        payload.expirationDate = new Date(payload.expirationDate);
        this.email = payload.Email;
        const currentTime = new Date();
        if (payload.expirationDate.getTime() < currentTime.getTime()) {
          this.expired = true;
        }
      } catch {
        this.error = true;
      }

    })
  }

  changePaswFailed(message: any) {
    this.errorMessage = message;
    this.loading = false;
    this.ngbModal.open(this.modalError);
  }

  changePaswSuccess(message: any) {
    this.successMessage = message;
    this.loading = false;
    this.closeModal();
    this.ngbModal.open(this.modalSuccess);
  }

  closeModal() {
    if (this.ngbModal.hasOpenModals()) {
      this.ngbModal.dismissAll();
    }
  }

  timeoutSuccesModal = () => {
    this.router.navigate(['/auth/login']);
  }

}
