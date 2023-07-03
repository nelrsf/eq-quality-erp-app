import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  title = 'eco-quality';
  ngAfterViewInit(): void {
    const theme = localStorage.getItem('theme');
    if(theme){
      document.querySelector('html')?.setAttribute('data-bs-theme', theme);
    }
  }
}
