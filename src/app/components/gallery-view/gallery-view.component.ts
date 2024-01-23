import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from '../miscelaneous/file-uploader/file-uploader.component';
import { FileService } from 'src/app/services/file.service';
import { environment } from 'src/environments/environment';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { DeviceDetectorService, DeviceType } from 'src/app/services/device-detector.service';
import { CameraComponent } from '../miscelaneous/camera/camera.component';
import { ImageUploaderComponent } from '../miscelaneous/image-uploader/image-uploader.component';
import { ErrorComponent } from '../alerts/error/error.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


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
    LoadingComponent,
    CameraComponent,
    ImageUploaderComponent,
    ErrorComponent
  ]
})
export class GalleryViewComponent {

  @Input() disabled: boolean = false;
  @Input() images: Array<string> = [];
  @Output() imagesChange = new EventEmitter<Array<string>>();
  @ViewChild('modalError') modalError!: TemplateRef<any>;
  @Output() blobChange = new EventEmitter<any>();

  icons = {
    edit: faEdit,
    delete: faTrash,
    add: faPlus
  }

  imgsLoading: Array<IImageLoadingState> = [];
  device!: DeviceType;
  cameraActive: boolean = false;
  downloadUrl: string = environment.filesUrl + '/download/';
  errorMessage: string = "";


  constructor(private modal: NgbModal, private deviceDetector: DeviceDetectorService, private fileService: FileService) { }

  ngOnInit(): void {
    this.getDevice();
    this.images.forEach(
      (img, index) => {
        this.setImgLoading(index);
      }
    )
  }

  getDevice() {
    this.deviceDetector.detectDevice()
      .then(
        (value: DeviceType) => {
          this.device = value;
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

  addImage(event: Array<string>) {
    this.images.push(...event);
    event.forEach(
      (img, index) => {
        const imgInd = this.images.indexOf(img);
        if (imgInd !== -1) {
          this.setImgLoading(imgInd);
        }
      }
    )

  }

  goToImage(imgUrl: string) {
    window.open(imgUrl);
  }

  changeImg(event: any, i: number) {
    this.images[i] = event[0];
    this.setImgLoading(i)
  }

  deleteFile(imgUrl: string, index: number) {
    // if (imgUrl.indexOf(environment.filesUrl) !== -1) {
    //   const pathSplitted = imgUrl.split('/');
    //   const fileName = pathSplitted[pathSplitted.length - 1];
    //   this.fileService.deleteFile(fileName)
    //     .subscribe(
    //       {
    //         next: (response) => {
    //           console.log(response);
    //         },
    //         error: (error) => {
    //           console.log(error)
    //         }
    //       }
    //     );
    // }

    this.images.splice(index, 1);
  }

  startCamera() {
    if (this.device === 'web') {
      return;
    }
    this.cameraActive = true;
  }

  onFilesAdded(files: Array<string>) {
    this.cameraActive = false;
    this.images.push(...files);
    files.forEach(
      (img, index) => {
        const imgInd = this.images.indexOf(img);
        if (imgInd !== -1) {
          this.setImgLoading(imgInd);
        }
      }
    )
  }

  saveChanges() {
    this.imagesChange.emit(this.images);
  }

  showErrorModal(event: string) {
    this.errorMessage = event;
    this.modal.open(this.modalError);
  }

}
