import { LatLng, LeafletMouseEvent, Marker, Polyline } from "leaflet";
import { IMarker } from "./IMarker";
import { MapsService } from "../maps.service";
import { IMapElement } from "./IMapElement";
import { IPath } from "./IPath";

export class EqPath {

    path: Partial<IPath> = {};
    temporalMarkers: Marker[] = [];
    temporalSegments: Polyline[] = [];

    pinNewMarker: (marker: IMarker) => Marker | undefined = (marker: IMarker) => { return undefined };
    renderPathSegment: (previous: Array<any>, current: Array<any>) => Polyline | undefined = (previous: Array<any>, current: Array<any>) => { return undefined };

    constructor(mapElement: IMapElement, private mapsService: MapsService) {
        if (mapElement) {
            this.path.mapElement = mapElement.id;
        }
    }

    onClickMap = (event: LeafletMouseEvent, insertMarkerByClick: boolean) => {
        if (!insertMarkerByClick) {
            return false;
        }
        insertMarkerByClick = false;
        const position: LatLng = event.latlng;

        const pointsStr = this.path.points;

        const pathMarker: Partial<IMarker> = {
            lat: position.lat,
            lng: position.lng
        };

        const tMarker = this.pinNewMarker(pathMarker as IMarker);
        if (tMarker) {
            this.temporalMarkers.push(tMarker);
        }


        if (!pointsStr) {
            this.path.points = JSON.stringify([[position.lat, position.lng]]);
        } else {
            const points = JSON.parse(pointsStr);
            if (Array.isArray(points)) {
                points.push([position.lat, position.lng]);
                this.path.points = JSON.stringify(points);
                const tSegment = this.renderPathSegment(points[points.length - 1], points[points.length - 2]);
                if (tSegment) {
                    this.temporalSegments.push(tSegment);
                }
            }
        }


        return true;
    }

    deleteTemporalPath() {
        this.temporalMarkers.forEach(
            (tm: Marker) => {
                tm.remove();
            }
        );
        this.temporalSegments.forEach(
            (ts: Polyline) => {
                ts.remove();
            }
        )
    }

    static isPath(data: any): boolean {
        return data.points;
    }
}