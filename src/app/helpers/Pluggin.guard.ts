import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PlugginGuard {
    canActivate(route: ActivatedRouteSnapshot): boolean {
        const plugginType = route.data['type'];
        switch (plugginType) {
            case 'maps':
                return this.checkMapsPluggin();
            default:
                return true
        }

    }

    checkMapsPluggin() {
        return environment.pluggins.maps;
    }





}