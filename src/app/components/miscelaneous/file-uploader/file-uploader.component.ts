import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { fromEvent } from 'rxjs';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'eq-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class FileUploaderComponent implements AfterViewInit {

  @ViewChild('fileUploader') fileUploader!: ElementRef;

  @Input() uploadButton!: Element;
  @Input() files!: Array<string>;
  @Input() multiple: boolean = true;
  @Input() accept: string = "image/*";
  @Output() filesChange = new EventEmitter<Array<string>>();

  constructor(private fileService: FileService) { }

  icons = {
    upload: faUpload,
  }
  filesData!: Array<any>;

  ngAfterViewInit(): void {
    if (this.uploadButton) {
      const clickEvent = fromEvent(this.uploadButton, "click");
      clickEvent.subscribe(
        (event: any) => {
          this.openFileExplorer(event)
        }
      );
    }
  }

  openFileExplorer(event: any) {
    event.preventDefault();
    this.fileUploader.nativeElement.click();
  }

  onSelectedFile(event: any) {
    event.preventDefault();
    this.filesData = event.target.files;
    const formData = new FormData();
    let filesLength = Array.from(this.filesData).length;
    filesLength = filesLength < 10 ? filesLength : 9;
    for (let i = 0; i < filesLength; i++) {
      formData.append('files', this.filesData[i]);
    }
    this.fileService.uploadFile(formData)
      .subscribe({
        next: (data: any) => {
          this.files.push(...data.urls);
          this.filesChange.emit(this.files);
        },
        error: (error) => {
          console.log(error)
        }
      })

  }

}
