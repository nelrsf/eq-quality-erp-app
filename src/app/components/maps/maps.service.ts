import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IMapElement } from "./Model/IMapElement";
import { IMarker } from "./Model/IMarker";

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

    updateMapElements(mapElement: IMapElement) {
        const { id, ...body } = mapElement;
        delete (body as any).icons;
        return this.http.patch(this.mapsApi + '/map-elements/' + mapElement.id, body);
    }

    updateMarkers(marker: IMarker) {
        const { id, ...body } = marker;
        return this.http.patch(this.mapsApi + '/markers/' + marker.id, body);
    }

    deleteMapElements(mapElement: IMapElement) {
        const { id, ..._body } = mapElement;
        return this.http.delete(this.mapsApi + '/map-elements/' + mapElement.id);
    }

    deleteMarker(marker: IMarker) {
        const { id, ..._body } = marker;
        return this.http.delete(this.mapsApi + '/markers/' + marker.id);
    }

    createMapElements(mapElement: IMapElement) {
        return this.http.post(this.mapsApi + '/map-elements/', mapElement);
    }

    createMarker(marker: IMarker) {
        return this.http.post(this.mapsApi + '/markers/', marker);
    }
}