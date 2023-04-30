import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from '../miscelaneous/file-uploader/file-uploader.component';
import { FileService } from 'src/app/services/file.service';
import { environment } from 'src/environments/environment';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';


interface IImageLoadingState {
  index: number,
  loading: boolean
}

@Component({
  selector: 'eq-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FileUploaderComponent,
    LoadingComponent
  ]
})
export class GalleryViewComponent {

  @Input() images: Array<string> = [];
  @Output() imagesChange = new EventEmitter<Array<string>>();

  icons = {
    edit: faEdit,
    delete: faTrash,
    add: faPlus
  }

  imgsLoading: Array<IImageLoadingState> = [];


  constructor(private router: Router, private fileService: FileService) { }

  ngOnInit(): void {
    this.images.forEach(
      (img, index)=>{
        this.setImgLoading(index);
      }
    )
  }

  setImgLoading(index: number) {
    const imgSlot = this.findImageSlot(index);
    if (!imgSlot) {
      this.imgsLoading.push({
        index: index,
        loading: true
      });
    } else {
      imgSlot.loading = !imgSlot.loading;
    }
  }

  setImgLoaded(index: number) {
    const imgSlot = this.findImageSlot(index);
    if (!imgSlot) {
      return
    }
    imgSlot.loading = false;
  }



  isLoading(index: number): boolean {
    const imgSlot = this.findImageSlot(index)

    if (!imgSlot) {
      return false;
    }

    return imgSlot?.loading;
  }

  findImageSlot(index: number): IImageLoadingState | undefined {
    return this.imgsLoading.find(
      imgSlot => {
        return imgSlot.index === index
      }
    );
  }

  addImage(event: any) {
    this.images.push(event[event.length - 1]);
    this.setImgLoading(this.images.length - 1)
  }

  goToImage(imgUrl: string) {
    window.open(imgUrl);
  }

  changeImg(event: any, i: number) {
    this.images[i] = event[0];
    this.setImgLoading(i)
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
