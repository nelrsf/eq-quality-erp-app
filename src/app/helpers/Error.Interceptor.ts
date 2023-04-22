import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, throwError } from "rxjs";
import { AuthService } from "../pages/auth/auth.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(
                catchError((err: any) => {
                    if (err.status === 401) {
                        this.router.navigate(['/unauthorized']);
                        this.authService.clearToken();
                    }
                    throw err;
                })
            )
    }

}