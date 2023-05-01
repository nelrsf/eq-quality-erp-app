import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  filesEndpoint: string = "/upload";
  deleteFilesEndpoint: string = "/remove";

  constructor(private http: HttpClient) { }

  uploadFile(files: any) {
    const requestUrl = environment.filesUrl + this.filesEndpoint;
    return this.http.post(requestUrl, files, {
      headers: { 
        'enctype': 'multipart/form-data',
        'Content-Type': 'multipart/form-data'
       }
    })
  }

  
  deleteFile(fileName: string) {
    const requestUrl = environment.filesUrl + this.deleteFilesEndpoint + "/" + fileName;
    return this.http.get(requestUrl);
  }
}
