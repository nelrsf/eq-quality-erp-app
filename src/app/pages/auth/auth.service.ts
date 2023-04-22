import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as crypto from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authEndpoint: string = "/auth";
  signupEndpoint: string = "/signup";
  loginEndpoint: string = "/login";
  changePasswordEndpoint: string = "/changepassword";
  sendRecoveryCodeEndpoint: string = "/recoverypassword";

  constructor(private http: HttpClient) { }

  getToken() {
    return localStorage.getItem("token");
  }

  setToken(token: string) {
    return localStorage.setItem("token", token);
  }

  clearToken() {
    localStorage.removeItem("token");
  }

  login(email: string, password: string) {
    const loginUrl = environment.authUrl + this.authEndpoint + this.loginEndpoint;
    return this.http.post(loginUrl, {
      Email: email,
      password: password
    })
  }

  signup(email: string, name: string) {
    const signupUrl = environment.authUrl + this.authEndpoint + this.signupEndpoint;
    return this.http.post(signupUrl, {
      Email: email,
      Nombre: name
    })
  }

  logout() {
    this.clearToken();
  }

  changePassword(oldPassword: string, newPassword: string, email: string, recoveryCode: string) {
    const reqUrl = environment.authUrl + this.authEndpoint + this.changePasswordEndpoint;
    return this.http.post(reqUrl, {
      Email: email,
      password: oldPassword,
      newPassword: newPassword,
      recoveryCode: recoveryCode
    })
  }

  decodeRecoverCode(code: string) { 
    const url64Decoded = window.atob(code);
    return crypto.AES.decrypt(url64Decoded, environment.recoveryCodeKey).toString(crypto.enc.Utf8);
  }

  sendRecoveryCode(email:string){
    const reqUrl = environment.authUrl + this.authEndpoint + this.sendRecoveryCodeEndpoint;
    return this.http.post(reqUrl, {
      Email: email,
      timeStamp: new Date().getTime()
    })
  }
}
