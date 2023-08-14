import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploaderComponent } from 'src/app/components/miscelaneous/file-uploader/file-uploader.component';

@Component({
  selector: 'eq-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    FileUploaderComponent,
    CommonModule
  ]
})
export class FileComponent implements OnInit {

  @Input() isRestricted: boolean = false;
  @Input() value!: string[];
  @Output() valueChange = new EventEmitter<string[]>();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.value = this.value ? this.value : [];
  }

  downloadFile() {
    const fileUrl = this.value[this.value.length - 1];
    window.open(fileUrl)
  }

  onFileChange(event: any){
    this.value = [event[event.length - 1]];
    this.valueChange.emit(this.value);
  }

}
