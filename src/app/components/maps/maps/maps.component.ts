import { AfterViewInit, Component, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MapsCustomizePanelComponent } from '../maps-customize-panel/maps-customize-panel.component';
import { Icon, LatLngExpression, LeafletEvent, LeafletMouseEvent, Map, Marker, Point, Polyline, Popup, divIcon, marker, point, polyline, popup, tileLayer } from 'leaflet';
import { IMapElement } from '../Model/IMapElement';
import { MapsService } from '../maps.service';
import { IMarker } from '../Model/IMarker';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MarkerInfoComponent } from '../marker-info/marker-info.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent, EQ_CONFIRM_MODAL_NO, EQ_CONFIRM_MODAL_YES } from '../../alerts/confirm/confirm.component';
import { EqMarker } from '../Model/Marker';
import { EqPath } from '../Model/Path';
import { IPath } from '../Model/IPath';


type EQ_MAP_CONTEXT_MENU_BUTTONS = 'delete' | 'end-path';

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
  popUpMenu!: Popup;
  currentElement!: EqMarker | EqPath;
  insertMarkerByClick: boolean = false;
  closeCustomPanel: Subject<void> = new Subject<void>();
  openMarkerInfoPanel: Subject<{ mapShape: IMarker | IPath, mapElement: IMapElement }> = new Subject<{ mapShape: IMarker | IPath, mapElement: IMapElement }>();
  mapCenter: LatLngExpression = this.getInitialMapCenter();
  mapZoom: number = this.getInitialMapZoom();
  mapShapeToDelete!: IMarker | IPath;
  leafletMapShapeToDelete!: Marker | Polyline;
  markers: Marker[] = [];
  paths: Polyline[] = [];

  constructor(private modal: NgbModal, private mapsService: MapsService, private renderer2: Renderer2) { }

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
    switch (mapElement.type) {
      case 'point':
        this.currentElement = new EqMarker(mapElement, this.mapsService);
        this.currentElement.pinNewMarker = this.pinNewMarker;
        break;
      case 'path':
        this.currentElement = new EqPath(mapElement, this.mapsService);
        this.currentElement.pinNewMarker = this.pinPathMarker;
        this.currentElement.renderPathSegment = this.renderPathSegment;
    }
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
    if (!this.currentElement) {
      return
    }
    this.insertMarkerByClick = this.currentElement.onClickMap(event, this.insertMarkerByClick);
  }

  pinNewMarker = (newMarker: IMarker) => {
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
      this.openMarkerInfoPanel.next({ mapShape: newMarker, mapElement: mapElement })
    });
    mark.addEventListener("dragend", (event) => {
      newMarker.lat = event.target._latlng.lat;
      newMarker.lng = event.target._latlng.lng;
      this.updateMarker(newMarker);
      console.log(event);
    });
    mark.addEventListener("contextmenu", (event) => {
      const latlng = event.target._latlng;
      this.showContextMenu(latlng, mark, newMarker, ['delete'])
    });
    this.markers.push(mark);
    mark.addTo(this.map);
  }

  getPathMarkerIcon(color?: string, stroke?: number) {
    const div: HTMLElement = this.renderer2.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.backgroundColor = color ? color : 'gray';
    div.style.borderRadius = '50px 50px';
    div.classList.add('hover-path-marker');
    const size = stroke ? stroke + 3 : 3;
    return divIcon({ className: 'path-marker', html: div, iconSize: [size, size] });
  }

  pinPathMarker = (newMarker: IMarker) => {

    const pathMarkerIcon = this.getPathMarkerIcon();
    const mark = marker([newMarker.lat, newMarker.lng], {
      draggable: true,
      icon: pathMarkerIcon,
    });
    this.showContextMenu(mark.getLatLng(), mark, newMarker, ['end-path']);
    mark.addTo(this.map);
    return mark;
  }

  renderPathSegment = (prev: Array<any>, curr: Array<any>) => {
    return polyline(
      [prev, curr],
      {
        color: 'gray'
      }
    ).addTo(this.map);
  }


  getMapIcons(event: any[]) {
    this.icons = event;
  }

  getMapElements(event: IMapElement[]) {
    this.mapElements = event;
    this.clearMap();
    this.getAllMarkers();
    this.getAllPaths();
  }

  clearMap() {
    this.markers.forEach(
      (m: Marker) => {
        m.remove();
      }
    );
    this.markers = [];
    this.paths.forEach(
      (p: Polyline) => {
        p.remove();
      }
    );
    this.paths = [];
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


  getAllPaths() {
    this.mapsService.getPaths()
      .subscribe(
        {
          next: (paths: any) => {
            paths?.forEach(
              (p: any) => {
                this.renderPath(p);
              }
            )
          },
          error: (error: any) => {
            console.log(error);
          }
        })
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
      this.deleteMapShape(this.mapShapeToDelete);
    } else if (result === EQ_CONFIRM_MODAL_NO) {
      this.modal.dismissAll();
    }
  }

  deleteMapShape(mapShape: IMarker | IPath) {
    if (EqMarker.isMarker(mapShape)) {
      this.mapsService.deleteMarker(this.mapShapeToDelete as IMarker)
        .subscribe({
          next: () => {
            this.modal.dismissAll();
            this.leafletMapShapeToDelete.remove();
          }
        });
    } else if (EqPath.isPath(mapShape)) {
      this.mapsService.deletePath(this.mapShapeToDelete as IPath)
        .subscribe({
          next: () => {
            this.modal.dismissAll();
            this.leafletMapShapeToDelete.remove();
            this.clearMap();
            this.getAllMarkers();
            this.getAllPaths();
          }
        });
    }
  }


  showContextMenu(latlng: LatLngExpression, llMapShape: Marker | Polyline, mapShape: IMarker | IPath, ctxButtons: EQ_MAP_CONTEXT_MENU_BUTTONS[]) {
    this.popUpMenu = popup(
      {
        content: this.contextMenu.nativeElement,
        closeButton: false,
        offset: point(0, -5, true)
      }).setLatLng(latlng);
    this.renderer2.removeClass(this.contextMenu.nativeElement, "d-none");
    this.renderer2.addClass(this.contextMenu.nativeElement, "d-block");

    if (ctxButtons.includes('delete')) {
      this.setDeleteListener(llMapShape, mapShape);
    }

    if (ctxButtons.includes('end-path')) {
      this.setEndPathListener();
    }

    this.popUpMenu.addEventListener('remove', this.hideMContextButtons)
    this.popUpMenu.openOn(this.map)
  }

  hideMContextButtons = () => {
    const buttons = this.contextMenu.nativeElement.childNodes;
    Array.from(buttons).forEach(
      (button: any) => {
        this.renderer2.addClass(button,'d-none');
      }
    )
  }

  setDeleteListener = (llMapShape: Marker | Polyline, mapShape: IMarker | IPath) => {
    const onClickDeleteButton = () => {
      this.mapShapeToDelete = mapShape;
      this.leafletMapShapeToDelete = llMapShape;
      this.modal.open(this.confirmDeleteMarker);
      this.popUpMenu?.close();
    }
    const deleteButton = this.contextMenu.nativeElement.querySelector("#delete-marker");
    this.renderer2.removeClass(deleteButton, "d-none");
    this.renderer2.addClass(deleteButton, "d-block");
    deleteButton.removeAllListeners();
    deleteButton.addEventListener("click", onClickDeleteButton);
  }

  setEndPathListener = () => {
    const onClickEndPathButton = () => {
      const path: EqPath = this.currentElement as EqPath;
      this.mapsService.createPath(path.path)
        .subscribe(
          {
            next: (pathResponse: any) => {
              path.deleteTemporalPath();
              this.renderPath(pathResponse);
            },
            error: (error: any) => {
              console.log(error);
            }
          }
        );
      this.insertMarkerByClick = false;
      this.popUpMenu?.close();
    }
    const pathEndButton = this.contextMenu.nativeElement.querySelector("#path-end");
    this.renderer2.removeClass(pathEndButton, "d-none");
    this.renderer2.addClass(pathEndButton, "d-block");
    pathEndButton.removeAllListeners();
    pathEndButton.addEventListener("click", onClickEndPathButton);
  }

  renderPath(path: IPath) {

    let mapElement: IMapElement | undefined;
    let pathColor: string | undefined;
    let stroke: number | undefined;
    if (path.mapElement) {
      mapElement = this.getMapElementById(path.mapElement);
      pathColor = mapElement?.pathColor;
      stroke = mapElement?.pathStroke;
    }

    const pointsStr = path.points;
    let points: any;
    if (pointsStr) {
      points = JSON.parse(pointsStr);
    }
    if (!Array.isArray(points)) {
      return;
    }

    const pathLine = polyline(
      points,
      {
        color: pathColor ? pathColor : 'gray',
        weight: stroke ? stroke : 3
      }
    ).addTo(this.map);

    this.paths.push(pathLine);
    pathLine.addEventListener('click',
      (event: any) => {
        if (!mapElement) {
          return;
        }
        this.openMarkerInfoPanel.next(
          {
            mapShape: path,
            mapElement: mapElement
          })
      });

    pathLine.addEventListener('contextmenu',
      (event: any) => {
        this.showContextMenu(event.latlng, pathLine, path, ['delete']);
      })



    const pathMarkers: Marker[] = [];

    points.forEach(
      (p: any, index: number) => {

        const icon = this.getPathMarkerIcon(pathColor, stroke);
        const pathMarker = marker(p,
          {
            icon: icon,
            draggable: true
          });
        pathMarker.addTo(this.map);
        pathMarkers.push(pathMarker);
        this.markers.push(pathMarker);

        const pathJoinMove = (event: any) => {
          const point = event.target._latlng;
          points[index] = [point.lat, point.lng];
          path.points = JSON.stringify(points);
          this.mapsService.updatePath(path)
            .subscribe(
              {
                next: (_path: any) => {
                  pathLine.remove();
                  pathMarkers.forEach(
                    (pm: Marker) => {
                      pm.remove();
                    }
                  )
                  this.renderPath(path);
                },
                error: (error: any) => {
                  console.log(error);
                }
              }
            )

        }

        pathMarker.addEventListener("dragend", pathJoinMove);
      }
    )


  }



}
