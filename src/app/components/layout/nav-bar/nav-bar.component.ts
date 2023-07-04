import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/pages/auth/auth.service';

@Component({
  selector: 'eq-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements AfterViewInit {

  theme: 'dark' | 'light' = 'light';

  icons = {
    lightTheme: faSun,
    darkTheme: faMoon
  }

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.theme = 'dark';
    } else if(theme === 'light'){
      this.theme = 'light';
    }
    this.cdr.detectChanges();
  }

  loguot() {
    this.authService.logout();
    this.router.navigate(['/auth/login'])
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

}
