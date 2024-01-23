import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faCog, faPencil, faTrash, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from 'src/app/components/miscelaneous/file-uploader/file-uploader.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { FileService } from 'src/app/services/file.service';
import { ImageUploaderComponent } from 'src/app/components/miscelaneous/image-uploader/image-uploader.component';
import { CameraComponent } from 'src/app/components/miscelaneous/camera/camera.component';
import { DeviceDetectorService, DeviceType } from 'src/app/services/device-detector.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-img-field',
  templateUrl: './img-field.component.html',
  styleUrls: ['./img-field.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    FontAwesomeModule,
    FileUploaderComponent,
    ImageUploaderComponent,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    CameraComponent
  ]
})
export class ImgFieldComponent implements OnInit {

  constructor(private http: HttpClient, private detectDeviceService: DeviceDetectorService) { }

  @Input() column: any;
  @Input() images!: Array<string>
  @Input() module!: string;
  @Output() imagesChange = new EventEmitter<Array<string>>();

  imageDownloadEndpoint = environment.filesUrl + '/download/';
  icons = {
    cog: faCog,
    camera: faCamera,
    upload: faUpload,
    addImage: faCirclePlus,
    edit: faPencil,
    delete: faTrash
  }

  imageUrl: string = "";
  imagePos: number = 0;
  previousImageUrl: string = "";

  isValidImgUrl: boolean = false;
  device!: DeviceType;
  cameraMode: boolean = false;

  ngOnInit(): void {
    this.images = this.images ? this.images : [];
    this.detectDevice()
  }

  isArray(data: any): data is Array<any> {
    return data.length !== undefined
  }

  addImage(event: Event, imgUrl: string) {
    event.preventDefault();
    if (!this.isArray(this.images)) {
      this.images = [imgUrl];
    } else {
      this.images.push(imgUrl)
    }
    this.imagesChange.emit(this.images);
  }

  async isValidInageUrl(imgUrl: string) {
    if (imgUrl === this.previousImageUrl) {
      return;
    }
    this.http.get(imgUrl).subscribe(
      {
        next: () => {
          this.previousImageUrl = imgUrl;
          this.isValidImgUrl = true;
        },
        error: () => {
          this.previousImageUrl = imgUrl;
          this.isValidImgUrl = false;
        }
      }
    )
  }

  detectDevice() {
    this.detectDeviceService.detectDevice()
      .then(
        (value) => {
          this.device = value;
        }
      ).catch(
        (error) => {
          console.log(error);
        }
      )
  }

  switchToCameraMode(event: Event) {
    event.preventDefault();
    this.cameraMode = !this.cameraMode;
  }

  onImagesChange(images: Array<string>) {
    this.cameraMode = !this.cameraMode;
    this.images.push(...images);
    this.imagesChange.emit(this.images);
  }

  appendImagesChange(imagesPack: string[]) {
    this.images.push(...imagesPack);
    this.imagesChange.emit(this.images);
  }

  deleteImg(event: any, imagePos: number) {
    event.preventDefault();
    if (imagePos >= 0) {
      this.images.splice(imagePos, 1);
      this.imageUrl = "";
      this.imagesChange.emit(this.images);
    }
  }

}
