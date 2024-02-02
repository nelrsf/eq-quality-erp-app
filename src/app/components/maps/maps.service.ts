import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IMapElement } from "./Model/IMapElement";
import { IMarker } from "./Model/IMarker";
import { IPath } from "./Model/IPath";

@Injectable({
    providedIn: 'root'
})
export class MapsService {

    private mapsApi: string = environment.mapsUrl;

    constructor(private http: HttpClient) { }

    getMapElements() {
        return this.http.get(this.mapsApi + '/map-elements');
    }

    getMapIcons() {
        return this.http.get(this.mapsApi + '/icons');
    }

    getMarkers() {
        return this.http.get(this.mapsApi + '/markers');
    }

    getPaths() {
        return this.http.get(this.mapsApi + '/paths');
    }

    updateMapElements(mapElement: IMapElement) {
        const { id, ...body } = mapElement;
        delete (body as any).icons;
        return this.http.patch(this.mapsApi + '/map-elements/' + mapElement.id, body);
    }

    updateMarkers(marker: IMarker) {
        const { id, ...body } = marker;
        return this.http.patch(this.mapsApi + '/markers/' + marker.id, body);
    }

    updatePath(path: IPath) {
        const { id, ...body } = path;
        return this.http.patch(this.mapsApi + '/paths/' + path.id, body);
    }

    deleteMapElements(mapElement: IMapElement) {
        const { id, ..._body } = mapElement;
        return this.http.delete(this.mapsApi + '/map-elements/' + mapElement.id);
    }

    deleteMarker(marker: IMarker) {
        return this.http.delete(this.mapsApi + '/markers/' + marker.id);
    }

    deletePath(path: IPath) {
        return this.http.delete(this.mapsApi + '/paths/' + path.id);
    }

    createMapElements(mapElement: IMapElement) {
        return this.http.post(this.mapsApi + '/map-elements/', mapElement);
    }

    createMarker(marker: IMarker) {
        return this.http.post(this.mapsApi + '/markers/', marker);
    }

    createPath(path: IPath) {
        return this.http.post(this.mapsApi + '/paths/', path);
    }
}