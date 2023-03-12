import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'eq-page-renderer',
  templateUrl: './page-renderer.component.html',
  styleUrls: ['./page-renderer.component.css']
})
export class PageRendererComponent implements OnInit {

  constructor(private router: Router){}

  ngOnInit(): void {
    this.subscribeToRouterEvents();
  }

  subscribeToRouterEvents(){
    this.router.events.subscribe(
      (event)=>{
        console.log(event)
        if(event instanceof NavigationStart){
          console.log(event)
        }
      }
    )
  }

}
