import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ParamGuard {
    canActivate(route: ActivatedRouteSnapshot): boolean {
        const url = route.routeConfig?.path;
        switch (url) {
            case "tables/:module/:route":
                return this.moduleParamsGuard(route);
            case "tables/:module":
                return this.moduleParamsGuard(route);
            case "tables/auxdata/:objectdata":
                return this.objectdataParamsGuard(route);
            case "tables/data/:module/:table":
                return this.moduleTableParamsGuard(route);
            case "columns/:module/:table/:columndata":
                return this.columnParamsGuard(route);
            case "images-gallery/:images":
                return this.imgGalleryParamsGuard(route);
            case "list/:listData":
                return this.listParamsGuard(route);
            default:
                return true;
        }
    }

    private moduleParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const module = route.params['module'];
        if (!module) {
            return false;
        }
        return true;
    }

    private objectdataParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const objectdata = route.params['objectdata'];
        if (!objectdata) {
            return false;
        }
        return true;
    }

    private moduleTableParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const module = route.params['module'];
        const table = route.params['table'];
        if (!module || !table) {
            return false;
        }
        return true;
    }

    private columnParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const columnData = route.params['columndata'];
        const module = route.params['module'];
        const table = route.params['table'];
        if (!columnData || !module || !table) {
            return false;
        }
        return true;
    }

    imgGalleryParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const images = route.params['images'];
        if (!images) {
            return false;
        }
        return true;
    }

    listParamsGuard(route: ActivatedRouteSnapshot): boolean {
        const listData = route.params['listData'];
        if (!listData) {
            return false;
        }
        return true;
    }
}