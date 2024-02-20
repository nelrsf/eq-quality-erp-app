import { Component, OnInit, Output } from '@angular/core';
import { IUser } from 'src/app/Model/interfaces/IUser';
import { UserService } from 'src/app/services/user.service';
import { FileUploaderComponent } from '../miscelaneous/file-uploader/file-uploader.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../miscelaneous/loading/loading.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'eq-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    FileUploaderComponent,
    CommonModule,
    LoadingComponent
  ]
})
export class UserProfileComponent implements OnInit {

  public user!: IUser;
  public imageFile: string[] = [];
  public errorMessage!: string;
  public successMessage!: string;
  public loading: boolean = false;
  public filesUrl = environment.filesUrl;
  public downloadEndpoint = '/download/'

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUserData();
    this.userService.getUserSubject()
      .subscribe(
        (_user: IUser | null) => {
          this.getUserData();
          console.log(this.user)
        }
      )
  }

  getUserData() {
    const user = this.userService.getUser();
    if (!user) {
      return;
    }
    this.user = user;
    this.imageFile = [this.user?.image ? this.user.image : '']
  }

  setUserImage() {
    if (!this.user) {
      return
    }
    this.user.image = this.imageFile[this.imageFile.length - 1];
  }

  getUserImage() {
    if(this.user?.image){
      return this.filesUrl + this.downloadEndpoint + this.user.image
    } else {
      return window.location.origin + '/assets/images/previews/1.jpg'
    }
  }

  saveUser() {
    this.loading = true;
    this.userService.saveUser(this.user)
      .subscribe(
        {
          next: (_result) => {
            this.successMessage = 'Usuario actualizado correctamente';
            this.userService.setUser(this.user);
            this.loading = false;
          },
          error: (error: any) => {
            this.errorMessage = 'Error al guardar el perfil de usuario';
            console.log(error);
            this.loading = false;
          }
        }
      )
  }

}
