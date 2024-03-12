import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MapsCustomizePanelComponent } from '../maps-customize-panel/maps-customize-panel.component';
import { DivIcon, Icon, LatLngExpression, Layer, LeafletMouseEvent, Map, Marker, Point, Polyline, Popup, TileLayer, TileLayerOptions, divIcon, marker, point, polyline, popup, tileLayer } from 'leaflet';
import { IMapElement } from '../Model/IMapElement';
import { MapsService } from '../maps.service';
import { IMarker } from '../Model/IMarker';
import { CommonModule } from '@angular/common';
import { Subject, firstValueFrom } from 'rxjs';
import { MarkerInfoComponent } from '../marker-info/marker-info.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent, EQ_CONFIRM_MODAL_NO, EQ_CONFIRM_MODAL_YES } from '../../alerts/confirm/confirm.component';
import { EqMarker } from '../Model/Marker';
import { EqPath } from '../Model/Path';
import { IPath } from '../Model/IPath';
import { DeviceDetectorService, DeviceType } from 'src/app/services/device-detector.service';
import { PermissionsService } from 'src/app/services/permissions.service';
import { ActivatedRoute, Params } from '@angular/router';


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

  module!: string;
  table!: string;
  mapElements: IMapElement[] = [];
  map!: Map;
  miniMap!: Map;
  miniMapDisabled: boolean = true;
  icons: any[] = [];
  popUpMenu!: Popup;
  currentElement!: EqMarker | EqPath;
  insertMarkerByClick: boolean = false;
  closeCustomPanel: Subject<void> = new Subject<void>();
  openMarkerInfoPanel: Subject<{ mapShape: IMarker | IPath, mapElement: IMapElement }> = new Subject<{ mapShape: IMarker | IPath, mapElement: IMapElement }>();
  mapCenter: LatLngExpression;
  mapZoom: number;
  mapShapeToDelete!: IMarker | IPath;
  leafletMapShapeToDelete!: Marker | Polyline;
  markers: Marker[] = [];
  pathMarkers: Marker[] = [];
  paths: Polyline[] = [];
  iPaths: IPath[] = [];
  iMarkers: IPath[] = [];
  baseZoom: number = 19;
  factor: number = 1;
  tileUrl: string = "";
  device!: DeviceType;


  constructor(private activatedRoute: ActivatedRoute, private permissionsService: PermissionsService, private deviceDetector: DeviceDetectorService, private modal: NgbModal, private mapsService: MapsService, private renderer2: Renderer2) {
    this.mapCenter = this.getInitialMapCenter();
    this.mapZoom = this.getInitialMapZoom();
  }

  async ngAfterViewInit(): Promise<void> {
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.module = params['module'];
        this.table = params['table'];
        this.initializeMapComponent();
      }
    )
  }

  initializeMapComponent() {
    this.deviceDetector.detectDevice().then(device => this.device = device);
    this.map = new Map('map').setView(this.mapCenter, this.mapZoom);
    this.selectMapTheme();
    this.map.addEventListener('click', this.onClickMap);
    this.map.addEventListener("zoom", this.onMapZoom);
    this.map.addEventListener("zoomend", this.onMapZoomEnd);
    this.map.addEventListener("moveend", this.onMapMove);
    this.map.addEventListener("keypress", this.onMapKeyPress);
    this.map.addEventListener("mouseover", (event: any) => {
      if (this.insertMarkerByClick) {
        event.originalEvent.stopPropagation();
      }
    });
  }

  async canEdit(shape: IMarker | IPath) {
    const mapElement = this.getMapElementById(shape?.mapElement ? shape.mapElement : -1);
    if (!mapElement) {
      return false;
    }
    const isOwner = await firstValueFrom(this.permissionsService.isOwner(mapElement.moduleRef));
    if (isOwner) {
      return true;
    }
    const isAdmin = await firstValueFrom(this.permissionsService.isAdmin(mapElement.moduleRef));
    if (isAdmin) {
      return true;
    }
    const editable = await firstValueFrom(this.permissionsService.canEditTable(mapElement.moduleRef, mapElement.tableRef));

    return editable;
  }

  getInitialMapZoom() {
    const zoomStr = localStorage.getItem("mapZoom");
    const zoom = parseInt(zoomStr ? zoomStr : "");
    return !isNaN(zoom) ? zoom : this.baseZoom;
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

  selectMapTheme() {
    this.tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const atribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    tileLayer(this.tileUrl, {
      maxZoom: this.baseZoom,
      updateWhenZooming: false,
      attribution: atribution
    }).addTo(this.map)

    // tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}', {
    //   minZoom: 0,
    //   maxZoom: 18,
    //   attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   ext: 'png'
    // } as TileLayerOptions).addTo(this.map)
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

  onMapZoomEnd = (event: any) => {
    this.updateZoomFactor();
    this.handleOnZoomMarkers(this.factor);
    this.handleOnZoomPathMarkers(this.factor);
    this.handleOnZoomPaths(this.factor);
  }

  updateZoomFactor() {
    const zoom = this.map.getZoom();
    const weight = 2.5;
    this.factor = (1 - weight * (this.baseZoom - zoom) / this.baseZoom);
    this.factor = this.factor > 0 ? this.factor : 0;
  }

  handleOnZoomPaths(factor: number) {
    this.paths.forEach(
      (p: Polyline) => {
        const pathId = parseInt(p?.options?.attribution ? p?.options?.attribution : '-1');
        const currPath = this.getPathById(pathId);
        const mapElement = this.getMapElementById(currPath?.mapElement ? currPath?.mapElement : -1)
        p.setStyle({
          weight: mapElement?.pathStroke ? mapElement.pathStroke * factor : 2
        })
      }
    )
  }


  handleOnZoomMarkers(factor: number) {
    this.markers.forEach(
      (m: Marker) => {
        const markerId = parseInt(m.options?.alt ? m.options?.alt : '-1');
        const iMarker = this.getMarkerById(markerId);
        const mapElement = this.getMapElementById(iMarker?.mapElement ? iMarker.mapElement : -1);
        const markerIcon = this.getMapIconById(mapElement?.icon ? mapElement?.icon : -1);
        const newIconSize: number = markerIcon?.anchor ? markerIcon?.anchor : this.baseZoom;
        const icon = m.options.icon;
        if (icon && icon.options && icon.options) {
          const { iconSize, ...rest } = icon.options;
          m.setIcon(new Icon({ iconSize: [newIconSize * factor, factor * newIconSize], ...rest }))
        }

      }
    )
  }

  handleOnZoomPathMarkers(factor: number) {
    this.pathMarkers.forEach(
      (m: Marker) => {
        const pathId = parseInt(m?.options?.alt ? m.options.alt : '-1');
        const pathObj = this.getPathById(pathId);
        if (!pathObj) return
        const pathDetails = this.getPathMarkerDetails(pathObj);
        const newIcon = this.getPathMarkerIcon(pathDetails.color, pathDetails.stroke);
        if (newIcon.options.iconSize) {
          const size = (pathDetails.stroke + 3) * factor;
          newIcon.options.iconSize = new Point(size, size);
        }
        m.setIcon(newIcon);

      }
    )
  }

  getPathById(id: number) {
    return this.iPaths.find(
      (ip: IPath) => {
        return ip.id === id;
      }
    )
  }

  getMarkerById(id: number) {
    return this.iMarkers.find(
      (im: IPath) => {
        return im.id === id;
      }
    )
  }

  onMapZoom = (event: any) => {
    this.updateZoomFactor();
    const zoom = event.target._zoom;
    localStorage.setItem("mapZoom", zoom);
  }

  @HostListener("keydown", ["$event"])
  onMapKeyPress(event: any) {
    if (event.key == 'Escape') {
      this.insertMarkerByClick = false;
    }
  }

  onMapMove = (_event: any) => {
    const center = this.map.getCenter();
    localStorage.setItem("mapCenter", JSON.stringify(center));
  }

  onClickMap = (event: LeafletMouseEvent) => {
    if (!this.currentElement) {
      return
    }
    event.originalEvent.stopPropagation();
    this.insertMarkerByClick = this.currentElement.onClickMap(event, this.insertMarkerByClick);
  }

  pinNewMarker = async (newMarker: IMarker) => {
    const mapElement: IMapElement | undefined = this.getMapElementById(newMarker.mapElement);
    if (!mapElement) {
      return;
    }
    const iconObj = this.getMapIconById(mapElement.icon);
    if (!iconObj) {
      return;
    }
    const iconSize = iconObj?.anchor ? iconObj.anchor : this.baseZoom;
    const icon = new Icon({
      iconUrl: iconObj.url,
      iconSize: [iconSize * this.factor, iconSize * this.factor],

    })
    const mark = marker([newMarker.lat, newMarker.lng], {
      icon: icon,
      draggable: await this.canEdit(newMarker),
      interactive: true,
      bubblingMouseEvents: true,
      alt: newMarker.id.toString()
    });
    mark.addEventListener("click", (event: LeafletMouseEvent) => {
      if (this.insertMarkerByClick) {
        return
      }
      this.closeCustomPanel.next();
      this.openMarkerInfoPanel.next({ mapShape: newMarker, mapElement: mapElement });
    });
    mark.addEventListener("dragstart", (event: any) => {
      this.dragStartMarkerhandler()
    })
    mark.addEventListener("drag", (event: any) => {
      this.dragMarkerHandler(event);
    })
    mark.addEventListener("dragend", (event) => {
      newMarker.lat = event.target._latlng.lat;
      newMarker.lng = event.target._latlng.lng;
      this.updateMarker(newMarker);
      this.miniMapDisabled = true;
    });
    mark.addEventListener("contextmenu", (event) => {
      const latlng = event.target._latlng;
      this.showContextMenu(latlng, mark, newMarker, ['delete']);
      this.miniMapDisabled = true;
    });
    this.markers.push(mark);
    this.iMarkers.push(newMarker);
    mark.addTo(this.map);
  }

  dragMarkerHandler(event: any) {
    if (this.device === 'web') {
      return;
    }
    this.miniMap.panTo(event.latlng)
    this.deepClearMap(this.miniMap);
    this.cloneMap(this.map, this.miniMap);
  }


  deepClearMap(map: Map) {
    map.eachLayer(
      (layer: Layer) => {
        if (!(layer instanceof TileLayer)) {
          layer.removeFrom(map);
        }

      }
    )
  }

  cloneMap(mapSource: Map, mapTarget: Map) {
    mapSource.eachLayer(
      (layer: Layer) => {
        let clonedLayer;
        if (layer instanceof Polyline) {
          clonedLayer = new Polyline(layer.getLatLngs() as LatLngExpression[], layer.options);
        } else if (layer instanceof TileLayer) {
          clonedLayer = tileLayer(this.tileUrl, layer.options);
          clonedLayer.options.attribution = "";
        } else if (layer instanceof Marker) {
          const { icon, ...rest } = layer.options;
          clonedLayer = marker(layer.getLatLng(), rest);
          if (icon instanceof DivIcon) {
            clonedLayer.setIcon(this.getPathMarkerIcon());
          } else {
            clonedLayer.setIcon(icon as Icon)
          }
        }
        clonedLayer?.addTo(mapTarget);
      }
    )
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
    this.pathMarkers.forEach(
      (pm: Marker) => {
        pm.remove();
      }
    );
    this.pathMarkers = [];
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
            this.iPaths = paths
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
            this.iMarkers = markers;
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


  async showContextMenu(latlng: LatLngExpression, llMapShape: Marker | Polyline, mapShape: IMarker | IPath, ctxButtons: EQ_MAP_CONTEXT_MENU_BUTTONS[]) {
    const canEdit = await this.canEdit(mapShape);
    if (!canEdit) {
      return;
    }
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
        this.renderer2.addClass(button, 'd-none');
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

  private getPathDetails(path: IPath): { pathColor: string, stroke: number } {
    const mapElement = this.getMapElementById(path?.mapElement ? path?.mapElement : -1);
    return {
      pathColor: mapElement?.pathColor ?? 'gray',
      stroke: mapElement?.pathStroke ?? 3
    };
  }

  private getPathMarkerDetails(path: IPath): { color: string, stroke: number } {
    const mapElement = this.getMapElementById(path?.mapElement ? path?.mapElement : -1);
    return {
      color: mapElement?.pathColor ?? 'gray',
      stroke: mapElement?.pathStroke ?? 3
    };
  }


  private buildPathLine(points: LatLngExpression[], pathDetails: { pathColor: string, stroke: number }, id: string | undefined): Polyline {
    return polyline(points, {
      color: pathDetails.pathColor,
      weight: pathDetails.stroke * this.factor,
      attribution: id ? id : ''
    }).addTo(this.map);
  }


  private handlePathLineEvents(pathLine: Polyline, path: IPath, mapElement: IMapElement | undefined): void {
    pathLine.addEventListener('click', () => {
      if (this.insertMarkerByClick) {
        return
      }
      if (!mapElement) return;
      this.openMarkerInfoPanel.next({ mapShape: path, mapElement: mapElement });
    });

    pathLine.addEventListener('contextmenu', (event) => {
      this.showContextMenu(event.latlng, pathLine, path, ['delete']);
    });
  }


  private createAndManagePathMarkers(points: any[], path: IPath): void {
    const pathDetails = this.getPathDetails(path);
    points.forEach((p: any, index: number) => {
      const icon = this.getPathMarkerIcon(pathDetails.pathColor, pathDetails.stroke);
      const pathMarker = marker(p,
        {
          icon: icon,
          draggable: true,
          alt: path.id?.toString()
        }).addTo(this.map);
      this.pathMarkers.push(pathMarker);

      pathMarker.addEventListener("dragend",
        (event) => {
          this.handleMarkerDragEnd(event, index, points, path, pathMarker);
          this.miniMapDisabled = true;
        });
      pathMarker.addEventListener("drag", event => {
        this.dragMarkerHandler(event);
        this.updateTemporalPath(event, index, points, path);
      });
      pathMarker.addEventListener("dragstart", event => {
        this.dragStartMarkerhandler();
      })
    });
  }

  private dragStartMarkerhandler() {
    this.miniMapDisabled = false;
    if (this.device === 'web') {
      return;
    }
    this.miniMap = new Map('minimap').setView(this.mapCenter, this.baseZoom);
    this.miniMap.options.attributionControl = false;
    this.miniMap.zoomControl.remove();
  }

  private updateTemporalPath(event: any, index: number, points: any[], path: IPath): void {
    if (this.device === 'web') {
      return;
    }
    const point = event.target._latlng;
    points[index] = [point.lat, point.lng];
    const tempPolyline = polyline(points);
    tempPolyline.addTo(this.miniMap)
  }

  private handleMarkerDragEnd(event: any, index: number, points: any[], path: IPath, pathMarker: Marker): void {
    const point = event.target._latlng;
    points[index] = [point.lat, point.lng];
    path.points = JSON.stringify(points);
    this.mapsService.updatePath(path).subscribe({
      next: () => {
        this.refreshPath(path);
      },
      error: (error: any) => console.log(error)
    });
  }

  private refreshPath(path: IPath): void {
    this.paths.forEach(p => p.remove());
    this.pathMarkers.forEach(m => m.remove());
    this.paths = [];
    this.pathMarkers = [];
    this.getAllPaths();
  }

  renderPath(path: IPath): void {
    const pointsStr = path.points;
    let points: any;
    if (pointsStr) {
      points = JSON.parse(pointsStr);
      if (!Array.isArray(points)) return;

      const pathDetails = this.getPathDetails(path);
      const pathLine = this.buildPathLine(points, pathDetails, path.id?.toString());
      this.paths.push(pathLine);
      this.iPaths.push(path);

      const mapElement = this.getMapElementById(path?.mapElement ? path?.mapElement : -1);
      this.handlePathLineEvents(pathLine, path, mapElement);
      this.createAndManagePathMarkers(points, path);
    }
  }

}
