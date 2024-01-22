import { AfterViewInit, Component, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MapsCustomizePanelComponent } from '../maps-customize-panel/maps-customize-panel.component';
import { Icon, LatLng, LatLngExpression, LeafletMouseEvent, Map, Marker, Point, marker, popup, tileLayer } from 'leaflet';
import { IMapElement } from '../Model/IMapElement';
import { MapsService } from '../maps.service';
import { IMarker } from '../Model/IMarker';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MarkerInfoComponent } from '../marker-info/marker-info.component';
import { NgbDropdown, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent, EQ_CONFIRM_MODAL_NO, EQ_CONFIRM_MODAL_YES } from '../../alerts/confirm/confirm.component';


@Component({
  selector: 'eq-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css'],
  standalone: true,
  imports: [
    MapsCustomizePanelComponent,
    MarkerInfoComponent,
    NgbDropdownModule,
    ConfirmDialogComponent,
    CommonModule
  ]
})
export class MapsComponent implements AfterViewInit {

  @ViewChild('contextMenu') contextMenu!: ElementRef;
  @ViewChild('confirmDeleteMarker') confirmDeleteMarker!: TemplateRef<any>;

  mapElements: IMapElement[] = [];
  map!: Map;
  icons: any[] = [];
  currentMarker: Partial<IMarker> = {};
  insertMarkerByClick: boolean = false;
  closeCustomPanel: Subject<void> = new Subject<void>();
  openMarkerInfoPanel: Subject<{ marker: IMarker, mapElement: IMapElement }> = new Subject<{ marker: IMarker, mapElement: IMapElement }>();
  mapCenter: LatLngExpression = this.getInitialMapCenter();
  mapZoom: number = this.getInitialMapZoom();
  markerToDelete!: IMarker;
  llMarkerToDelete!: Marker;

  constructor(private modal: NgbModal,private mapsService: MapsService, private renderer2: Renderer2) { }

  ngAfterViewInit(): void {
    this.map = new Map('map').setView(this.mapCenter, this.mapZoom);
    this.selectMapTheme(this.map);
    this.map.addEventListener('click', this.onClickMap);
    this.map.addEventListener("zoom", this.onMapZoom);
    this.map.addEventListener("moveend", this.onMapMove);
  }

  getInitialMapZoom() {
    const zoomStr = localStorage.getItem("mapZoom");
    const zoom = parseInt(zoomStr ? zoomStr : "");
    return !isNaN(zoom) ? zoom : 17;
  }

  getInitialMapCenter() {
    const centerStr = localStorage.getItem("mapCenter");
    try {
      const center = JSON.parse(centerStr ? centerStr : "");
      if (!center) {
        return [7.0679784451182845, -73.85419861588933];
      }
      return center
    }
    catch {
      return [7.0679784451182845, -73.85419861588933];
    }
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

  onMapZoom = (event: any) => {
    const zoom = event.target._zoom;
    localStorage.setItem("mapZoom", zoom);
  }

  onMapMove = (_event: any) => {
    const center = this.map.getCenter();
    localStorage.setItem("mapCenter", JSON.stringify(center));
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
      iconSize: new Point(17, 17, true)
    })
    const mark = marker([newMarker.lat, newMarker.lng], {
      icon: icon,
      draggable: true,
      alt: newMarker.id.toString()
    });
    mark.addEventListener("click", (event) => {
      this.closeCustomPanel.next();
      this.openMarkerInfoPanel.next({ marker: newMarker, mapElement: mapElement })
    });
    mark.addEventListener("dragend", (event) => {
      newMarker.lat = event.target._latlng.lat;
      newMarker.lng = event.target._latlng.lng;
      this.updateMarker(newMarker);
      console.log(event);
    });
    mark.addEventListener("contextmenu", (event) => {
      const popupMenu = popup({ content: this.contextMenu.nativeElement, closeButton: false })
        .setLatLng(mark.getLatLng());
      this.renderer2.removeClass(this.contextMenu.nativeElement, "d-none");
      this.renderer2.addClass(this.contextMenu.nativeElement, "d-inline-flex");
      const deleteButton = this.contextMenu.nativeElement.querySelector("#delete-marker");
      deleteButton.removeAllListeners();
      deleteButton.addEventListener("click", () => {
        this.markerToDelete = newMarker;
        this.llMarkerToDelete = mark;
        this.modal.open(this.confirmDeleteMarker);
        popupMenu.close();
      });
      popupMenu.openOn(this.map)
    });
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
          },
          error: (error: any) => {
            console.log(error);
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

  updateMarker(marker: IMarker) {
    this.mapsService.updateMarkers(marker)
      .subscribe({
        error: (error: any) => {
          console.log(error);
        }
      })
  }

  onSubmitDeleteModal(result: number) {
    if (result === EQ_CONFIRM_MODAL_YES) {
      this.mapsService.deleteMarker(this.markerToDelete)
        .subscribe({
          next: () => {
            this.modal.dismissAll();
            this.llMarkerToDelete.remove();
          }
        })
    } else if (result === EQ_CONFIRM_MODAL_NO) {
      this.modal.dismissAll();
    }
  }




}
