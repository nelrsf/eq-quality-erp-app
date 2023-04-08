import { Component, ElementRef, Host, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'eq-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

  @Input("menuTemplate") menuTemplate!: TemplateRef<void>;
  @ViewChild("sideBarWrapper") sideBarWrapper!: ElementRef;

  icons = {
    bars: faBars
  }

  hideSideBar() {
    if (!this.sideBarWrapper) {
      return
    }
    const classListSideBar = this.sideBarWrapper.nativeElement.classList;
    classListSideBar.remove("sidebar-pinned");
  }

  toggleSideBar(event: any) {
    event.stopPropagation();
    if (!this.sideBarWrapper) {
      return
    }
    const classListSideBar = this.sideBarWrapper.nativeElement.classList;
    classListSideBar.toggle("sidebar-pinned");
  }

}
