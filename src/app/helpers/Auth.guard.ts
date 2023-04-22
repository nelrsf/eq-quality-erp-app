import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { AuthService } from "../pages/auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {

    constructor(private authService: AuthService, private router: Router){}
    canActivate(route: ActivatedRouteSnapshot): boolean {
        const token = this.authService.getToken();
        if(!token){
            this.router.navigate(['/auth/login'])
            return false;
        }
        return true;
    }
}