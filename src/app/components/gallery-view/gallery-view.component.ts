import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from '../miscelaneous/file-uploader/file-uploader.component';
import { FileService } from 'src/app/services/file.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FileUploaderComponent
  ]
})
export class GalleryViewComponent {

  icons = {
    edit: faEdit,
    delete: faTrash,
    add: faPlus
  }

  @Input() images: Array<string> = [];
  @Output() imagesChange = new EventEmitter<Array<string>>();

  constructor(private router: Router, private fileService: FileService) { }

  ngOnInit(): void {
  }

  // onSubmit(){
  //   this.imagesChange.emit(this.images);
  // }

  addImage(event: any) {
    this.images.push(...event);
  }

  goToImage(imgUrl: string) {
    window.open(imgUrl);
  }

  changeImg(event: any, i: number) {
    this.images[i] = event[0];
  }

  deleteFile(imgUrl: string, index: number) {
    if (imgUrl.indexOf(environment.filesUrl) !== -1) {
      const pathSplitted = imgUrl.split('/');
      const fileName = pathSplitted[pathSplitted.length - 1];
      this.fileService.deleteFile(fileName)
        .subscribe(
          {
            next: (response) => {
              console.log(response);
            },
            error: (error) => {
              console.log(error)
            }
          }
        );
    }

    this.images.splice(index, 1);
  }

}
