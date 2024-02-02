import { LatLng, LeafletMouseEvent } from "leaflet";
import { IMarker } from "./IMarker";
import { MapsService } from "../maps.service";
import { IMapElement } from "./IMapElement";

export class EqMarker {

    marker!: Partial<IMarker>;

    pinNewMarker: (marker: IMarker) => void = (marker: IMarker) => { };

    constructor(mapElement: IMapElement, private mapsService: MapsService) {
        if (mapElement) {
            this.marker.mapElement = mapElement.id;
        }


    }

    onClickMap = (event: LeafletMouseEvent, insertMarkerByClick: boolean) => {
        if (!insertMarkerByClick) {
            return false;
        }
        insertMarkerByClick = false;
        const position: LatLng = event.latlng;
        this.marker.lat = position.lat;
        this.marker.lng = position.lng;
        this.mapsService.createMarker(this.marker as IMarker)
            .subscribe(
                {
                    next: (marker: any) => {
                        this.pinNewMarker(marker);
                    },
                    error: (error: any) => {
                        console.log(error)
                    }
                }
            );
        return insertMarkerByClick;
    }

    static isMarker(data: any): boolean {
        return data.lat && data.lng;
    }
}