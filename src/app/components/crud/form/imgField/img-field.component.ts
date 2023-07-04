import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faCog, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FileUploaderComponent } from 'src/app/components/miscelaneous/file-uploader/file-uploader.component';

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
    FileUploaderComponent
  ]
})
export class ImgFieldComponent implements OnInit{

  constructor(private http: HttpClient) { }

  @Input() column: any;
  @Input() images!: Array<string>
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
}
