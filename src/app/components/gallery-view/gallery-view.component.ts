import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eq-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.css'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class GalleryViewComponent {

  @Input() images: Array<string> = [];
  @Output() imagesChange = new EventEmitter<Array<string>>();

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this.activatedRoute.params.subscribe((params) => {
    //   const objectdataStr = params['images'];
    //   if (!objectdataStr) {
    //     return;
    //   }
    //   let objectdata;
    //   try {
    //     objectdata = JSON.parse(objectdataStr)
    //   } catch (error) {
    //     console.log('Error parsing JSON string:');
    //   };

    //   this.images = objectdata;
    // })
  }

  onSubmit(){
    this.imagesChange.emit(this.images);
  }

}
