import { AfterViewInit, Component } from '@angular/core';
import { MapsCustomizePanelComponent } from '../maps-customize-panel/maps-customize-panel.component';
import { Icon, LatLng, LeafletMouseEvent, Map, Marker, Point, marker, tileLayer } from 'leaflet';
import { IMapElement } from '../Model/IMapElement';
import { MapsService } from '../maps.service';
import { IMarker } from '../Model/IMarker';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MarkerInfoComponent } from '../marker-info/marker-info.component';


@Component({
  selector: 'eq-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css'],
  standalone: true,
  imports: [
    MapsCustomizePanelComponent,
    MarkerInfoComponent,
    CommonModule
  ]
})
export class MapsComponent implements AfterViewInit {

  mapElements: IMapElement[] = [];
  map!: Map;
  icons: any[] = [];
  currentMarker: Partial<IMarker> = {};
  insertMarkerByClick: boolean = false;
  closeCustomPanel: Subject<void> = new Subject<void>();
  openMarkerInfoPanel: Subject<{ marker: IMarker, mapElement: IMapElement }> = new Subject<{ marker: IMarker, mapElement: IMapElement }>();

  constructor(private mapsService: MapsService) { }

  ngAfterViewInit(): void {
    this.map = new Map('map').setView([7.0679784451182845, -73.85419861588933], 17);
    this.selectMapTheme(this.map);
    this.map.addEventListener('click', this.onClickMap);
  }

  selectMapTheme(map: Map) {
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)
  }

  insertMarker(mapElement: IMapElement) {
    if (!this.map) {
      return;
    }
    this.currentMarker.mapElement = mapElement.id;
    this.insertMarkerByClick = true;
  }

  onClickMap = (event: LeafletMouseEvent) => {
    if (!this.insertMarkerByClick) {
      return;
    }
    this.insertMarkerByClick = false;
    const position: LatLng = event.latlng;
    this.currentMarker.lat = position.lat;
    this.currentMarker.lng = position.lng;
    this.mapsService.createMarker(this.currentMarker as IMarker)
      .subscribe(
        {
          next: (marker: any) => {
            this.pinNewMarker(marker);
          },
          error: (error: any) => {
            console.log(error)
          }
        }
      )
  }

  pinNewMarker(newMarker: IMarker) {
    const mapElement: IMapElement | undefined = this.getMapElementById(newMarker.mapElement);
    if (!mapElement) {
      return;
    }
    const iconObj = this.getMapIconById(mapElement.icon);
    if (!iconObj) {
      return;
    }
    const icon = new Icon({
      iconUrl: iconObj.url,
      iconSize: new Point(25, 25, true)
    })
    const mark = marker([newMarker.lat, newMarker.lng], {
      icon: icon,
      draggable: true,
      alt: newMarker.id.toString()
    });
    mark.addEventListener("click", (event) => {
      this.closeCustomPanel.next();
      this.openMarkerInfoPanel.next({ marker: newMarker, mapElement: mapElement })
    })
    mark.addTo(this.map);
  }


  getMapIcons(event: any[]) {
    this.icons = event;
  }

  getMapElements(event: IMapElement[]) {
    this.mapElements = event;
    this.getAllMarkers();
  }

  getMapIconById(id: number) {
    return this.icons.find(
      (icon: any) => {
        return icon.id === id;
      }
    )
  }

  getMapElementById(id: number) {
    return this.mapElements.find(
      (me: any) => {
        return me.id === id;
      }
    )
  }

  getAllMarkers() {
    this.mapsService.getMarkers()
      .subscribe(
        {
          next: (markers: any) => {
            this.renderMarkers(markers);
          }
        }
      )
  }

  renderMarkers(markers: IMarker[]) {
    if (markers.length === 0) {
      return;
    }
    markers.forEach(
      (m: IMarker) => {
        this.pinNewMarker(m);
      }
    )
  }


}
