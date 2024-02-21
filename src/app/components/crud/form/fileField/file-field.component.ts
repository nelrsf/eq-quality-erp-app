import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileUploaderComponent } from 'src/app/components/miscelaneous/file-uploader/file-uploader.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-file-field',
  templateUrl: './file-field.component.html',
  styleUrls: ['./file-field.component.css'],
  standalone: true,
  imports: [
    FileUploaderComponent,
    CommonModule
  ]
})
export class FileFieldComponent implements OnInit {

  @Input() files!: Array<string>;
  @Input() editable: boolean = true;
  @Output() filesChange = new EventEmitter<Array<string>>();


  ngOnInit(): void {
    this.files = this.files ? this.files : [];
  }

  onFileChange(event: any){
    this.filesChange.emit(event);
  }

  getDownloadLink(fileUrl: string){
    return environment.filesUrl + '/download/' + encodeURIComponent(fileUrl);
  }
}
