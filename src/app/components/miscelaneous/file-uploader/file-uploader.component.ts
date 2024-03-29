import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { fromEvent } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorComponent } from '../../alerts/error/error.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'eq-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoadingComponent,
    ErrorComponent,
    NgbModalModule
  ]
})
export class FileUploaderComponent implements AfterViewInit {

  @ViewChild('fileUploader') fileUploader!: ElementRef;
  @ViewChild('loadingSpinner') loadingSpinner!: TemplateRef<any>;

  @Input() uploadButton!: Element;
  @Input() files!: Array<string>;
  @Input() multiple: boolean = true;
  @Input() accept: string = "image/*";
  @Input() returnBlob: boolean = false;
  @Input() editable: boolean = true;
  @Output() blobChange = new EventEmitter<any>();
  @Output() onError = new EventEmitter<string>();
  @Output() filesChange = new EventEmitter<Array<string>>();

  constructor(private fileService: FileService, private renderer: Renderer2, private viewContainerRef: ViewContainerRef, private cdr: ChangeDetectorRef) { }


  icons = {
    upload: faUpload,
  }
  filesData!: Array<any>;
  loading: boolean = false;
  payloadLargeMessage: string = "El archivo debe tener un tamaño menor a 1mb";


  ngAfterViewInit(): void {
    if (this.uploadButton) {
      this.renderer.setStyle(this.uploadButton, 'position', 'relative');
      const viewRef = this.viewContainerRef.createEmbeddedView(this.loadingSpinner);
      this.renderer.insertBefore(this.uploadButton, viewRef.rootNodes[0], this.uploadButton.childNodes[0]);
      const clickEvent = fromEvent(this.uploadButton, "click");
      clickEvent.subscribe(
        (event: any) => {
          this.openFileExplorer(event);
        }
      );
    }
    this.cdr.detectChanges();
  }

  openFileExplorer(event: any) {
    event.preventDefault();
    this.fileUploader.nativeElement.click();
  }

  checkFilesSize(files: any[]) {
    const maxSize = 1048576; // 1MB in bytes
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        return true;
      }
    }
    return false;
  }

  onSelectedFile(event: any) {
    event.preventDefault();
    this.filesData = event.target.files;
    if (this.checkFilesSize(this.filesData)) {
      this.onError.emit(this.payloadLargeMessage);
      return
    };
    this.loading = true;
    if (this.returnBlob) {
      this.blobChange.next(this.filesData);
      this.loading = false;
      return;
    }
    const formData = new FormData();
    let filesLength = Array.from(this.filesData).length;
    filesLength = filesLength < 10 ? filesLength : 9;
    for (let i = 0; i < filesLength; i++) {
      formData.append('files', this.filesData[i]);
    }
    this.fileService.uploadFile(formData)
      .subscribe({
        next: (data: any) => {
          this.files = [];
          this.files.push(...data.urls);
          this.filesChange.emit(this.files);
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
          this.loading = false;
        }
      })

  }

}
