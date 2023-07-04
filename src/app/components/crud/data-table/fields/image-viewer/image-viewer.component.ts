import { BrowserPlatformLocation, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { ColumnTypes } from 'src/app/Model/interfaces/IColumn';

@Component({
  selector: 'eq-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    TooltipDirective
  ]
})
export class ImageViewerComponent implements OnInit{

  @Input() value!: any;
  @Output() valueChange = new EventEmitter<any>();
  @Output() openModal = new EventEmitter<ColumnTypes>();

  curentIndex: number = 0;

  thumbStr = "?thumb=true";

  icons = {
    next: faAngleRight,
    previous: faAngleLeft
  }


  constructor(private router: Router) { }

  ngOnInit(): void {
    this.value = this.value ? this.value : '../../../../../../assets/images/previews/1.jpg';
  }


  getLinkAsThumb(link: string): string {
    if (typeof link !== "string") {
      return "";
    }
    return link + this.thumbStr;
  }

  onChange(event: any) {
    this.valueChange.emit(event.target.value)
  }

  isArray() {
    return Array.isArray(this.value);
  }

  nextPicture() {
    if (this.isArray()) {
      this.curentIndex++;
      if (this.curentIndex >= this.value.length) {
        this.curentIndex = 0;
      }
    }
  }

  previousPicture() {
    if (this.isArray()) {
      this.curentIndex--;
      if (this.curentIndex < 0) {
        this.curentIndex = this.value.length - 1;
      }
    }
  }

  openViewGallery() {
    this.openModal.emit(ColumnTypes.image);
    // const galleryRoute = JSON.stringify(this.value);
    // this.router.navigate(["/images-gallery", galleryRoute]);
  }
}
