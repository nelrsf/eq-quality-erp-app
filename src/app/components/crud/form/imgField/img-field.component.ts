import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faCog, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from 'src/app/components/miscelaneous/file-uploader/file-uploader.component';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { Camera, CameraResultType } from '@capacitor/camera';
import { FileService } from 'src/app/services/file.service';
import { table } from 'console';

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
    ShowIfIsAdmin,
    ShowIfIsOwner
  ]
})
export class ImgFieldComponent implements OnInit {

  constructor(private http: HttpClient, private fileService: FileService) { }

  @Input() column: any;
  @Input() images!: Array<string>
  @Input() module!: string;
  @Output() imagesChange = new EventEmitter<Array<string>>();

  icons = {
    cog: faCog,
    camera: faCamera,
    upload: faUpload,
    addImage: faCirclePlus
  }

  imageUrl: string = "";
  previousImageUrl: string = "";

  isValidImgUrl: boolean = false;

  ngOnInit(): void {
    this.images = this.images ? this.images : [];
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

  async startCamera(event: any) {
    event.preventDefault();
    const picture = await Camera.getPhoto(
      {
        resultType: CameraResultType.Base64,
      }
    );
    if (!picture.base64String) {
      return;
    }
    const fileName = this.generateRandomName(5) + '.' + picture.format;
    this.uploadBase64File(picture.base64String, fileName);
  }

  uploadBase64File(base64Data: string, fileName: string): void {
    // Convertir el archivo base64 en un objeto Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    // Crear un objeto FormData y agregar el archivo con el nombre 'file'
    const formData = new FormData();
    formData.append('files', blob, fileName);

    // Enviar el archivo al servidor utilizando el servicio uploadFile
    this.fileService.uploadFile(formData).subscribe(
      {
        next: (response: any) => {
          console.log('Archivo subido exitosamente', response);
          // this.images = [];
          // this.images = response.urls;
          this.imageUrl = response.urls[response.urls.length - 1];
          // this.imagesChange.emit(this.images);
        },
        error: error => {
          console.error('Error al subir el archivo', error);
        }
      }
    );
  }

  generateRandomName(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomName += characters.charAt(randomIndex);
    }

    const timestamp = Date.now();
    return `${randomName}_${timestamp}`;
  }

}
