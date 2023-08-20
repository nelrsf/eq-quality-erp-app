import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
import { fromEvent } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { LoadingComponent } from '../loading/loading.component';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'eq-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoadingComponent
  ]
})
export class ImageUploaderComponent implements AfterViewInit {

  @ViewChild('imageUploader') imageUploader!: ElementRef;
  @ViewChild('loadingSpinner') loadingSpinner!: TemplateRef<any>;

  @Input() uploadButton!: Element;
  @Input() files!: Array<string>;
  @Input() multiple: boolean = true;
  @Input() accept: string = "image/*";
  @Output() filesChange = new EventEmitter<Array<string>>();

  constructor(private fileService: FileService, private renderer: Renderer2, private viewContainerRef: ViewContainerRef, private cdr: ChangeDetectorRef) { }
 
  
  icons = {
    camera: faCamera,
  }
  filesData!: Array<any>;
  loading: boolean = false;

  ngAfterViewInit(): void {
    if (this.uploadButton) {
      this.renderer.setStyle(this.uploadButton, 'position', 'relative');
      const viewRef = this.viewContainerRef.createEmbeddedView(this.loadingSpinner);
      this.renderer.insertBefore(this.uploadButton, viewRef.rootNodes[0], this.uploadButton.childNodes[0]);
      const clickEvent = fromEvent(this.uploadButton, "click");
      clickEvent.subscribe(
        (event: any) => {
          this.startCamera(event);
        }
      );
    }
    this.cdr.detectChanges();
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
    this.loading = true;
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
          this.filesChange.emit(response.urls);
          this.loading = false;
        },
        error: error => {
          console.error('Error al subir el archivo', error);
          this.loading = false;
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
