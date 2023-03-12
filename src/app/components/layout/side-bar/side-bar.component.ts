import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

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

  hideSideBar(){
    if (!this.sideBarWrapper) {
      return
    }
    const classListSideBar = this.sideBarWrapper.nativeElement.classList;
    classListSideBar.remove("sidebar-pinned");
  }

  toggleSideBar() {
    if (!this.sideBarWrapper) {
      return
    }
    const classListSideBar = this.sideBarWrapper.nativeElement.classList;
    classListSideBar.toggle("sidebar-pinned");
  }

}
