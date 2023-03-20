import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCirclePlus, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eq-img-field',
  templateUrl: './img-field.component.html',
  styleUrls: ['./img-field.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    FontAwesomeModule
  ]
})
export class ImgFieldComponent {

  constructor(private http: HttpClient) { }

  @Input() column: any;
  @Input() images!: Array<string>

  icons = {
    drag: faUpDownLeftRight,
    camera: faCamera,
    upload: faUpload,
    addImage: faCirclePlus
  }

  imageUrl: string = "";
  previousImageUrl: string = "";

  isValidImgUrl: boolean = false;

  isArray(data: any): data is Array<any> {
    return data.length !== undefined
  }

  addImage(imgUrl: string) {
    if (!this.isArray(this.images)) {
      this.images = [imgUrl];
    } else {
      this.images.push(imgUrl)
    }
    this.imageUrl = "";
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
