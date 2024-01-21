import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'src/app/Model/interfaces/IUser';
import { AuthService } from 'src/app/pages/auth/auth.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements AfterViewInit, OnDestroy {

  @ViewChild('userModal') userModal!: ElementRef;

  theme: 'dark' | 'light' = 'light';
  userData!: IUser;

  icons = {
    lightTheme: faSun,
    darkTheme: faMoon
  }

  constructor(private authService: AuthService, private router: Router, private ngbModal: NgbModal, private cdr: ChangeDetectorRef, private userService: UserService) { }
  
  ngOnDestroy(): void {
    this.userService.setUser(null);
  }

  ngAfterViewInit(): void {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.theme = 'dark';
    } else if (theme === 'light') {
      this.theme = 'light';
    }
    this.getUserData();
    this.cdr.detectChanges();
  }

  loguot() {
    this.authService.logout();
    this.userService.setUser(null);
    this.router.navigate(['/auth/login']);
  }

  switchTheme() {
    if (this.theme == 'light') {
      this.theme = 'dark';
    } else {
      this.theme = 'light';
    }

    document.querySelector('html')?.setAttribute('data-bs-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  getTheme() {
    switch (this.theme) {
      case 'dark':
        return 'Tema Claro';
      default:
        return 'Tema Oscuro'
    }
  }

  openUserCustomizer() {
    this.ngbModal.open(this.userModal);
  }

  getUserData() {
    this.userService.getUserSubject()
      .subscribe(
        (user: IUser | null) => {
          if (!user) {
            return;
          }
          this.userData = user;
        }
      )
  }

  getProfileImage(){
    return this.userData?.image ? this.userData.image : '../../../../assets/images/previews/1.jpg'
  }

  checkMapsPluggin(){
    return environment.pluggins.maps;
  }

}
