import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasModule, NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, Subscriber, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { IMarker } from '../Model/IMarker';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { IMapElement } from '../Model/IMapElement';
import { FormComponent } from '../../crud/form/form.component';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { MapsService } from '../maps.service';
import { ConfirmDialogComponent } from '../../alerts/confirm/confirm.component';
import { IPath } from '../Model/IPath';
import { EqMarker } from '../Model/Marker';
import { EqPath } from '../Model/Path';

@Component({
  selector: 'eq-marker-info',
  templateUrl: './marker-info.component.html',
  styleUrls: ['./marker-info.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgbTypeaheadModule,
    NgbOffcanvasModule,
    FormComponent,
    ConfirmDialogComponent
  ]
})
export class MarkerInfoComponent implements AfterViewInit {

  @ViewChild('content') content!: ElementRef;
  @Input() openPanel!: Subject<{ mapShape: IMarker | IPath, mapElement: IMapElement }>;

  mainLinst: any[] = [];
  mapElement!: IMapElement;
  mapShape!: IMarker | IPath;
  formItem: any;
  columnMetadata: IColumn | undefined;

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.columnMetadata = undefined;
        if (!this.mapElement) {
          return of([]);
        }

        return this.getTableData(this.mapElement, term).pipe(
          map(data => {
            return data as string[];
          }),
          catchError(error => {
            console.error(error);
            return of([]);
          })
        );
      })
    );

  resultFormatter = (item: any) => {
    return item[this.mapElement.columnRef]
  }

  constructor(private offcanvasService: NgbOffcanvas, private tableService: TablesService, private mapsService: MapsService) { }

  ngAfterViewInit(): void {
    this.setOpenPanelSubject();
  }

  setOpenPanelSubject() {
    if (!this.openPanel) {
      return;
    }
    this.openPanel.subscribe(
      (data: { mapShape: IMarker | IPath, mapElement: IMapElement }) => {
        this.columnMetadata = undefined;
        this.formItem = undefined;
        this.offcanvasService.open(this.content, { position: 'end' });
        this.mapElement = data.mapElement;
        this.mapShape = data.mapShape;
        if (this.mapShape.idRef) {
          this.getItemByRefId();
        }
      }
    )
  }

  getTableData(mapElement: IMapElement, value: string) {
    return this.tableService.getRowsByColumnAndSimilarValue(mapElement?.moduleRef, mapElement?.tableRef, mapElement?.columnRef, value);
  }

  onSelectItem(event: any) {
    this.mapShape.idRef = event?.item?._id ? event.item._id : null;
    this.updateIdRef(this.mapShape)
      .subscribe(
        {
          next: (_response: any) => {
            if (!event.item) {
              return;
            }
            this.formItem = event.item;
            this.getColumns();
          },
          error: (error: any) => {
            console.log(error);
          }
        }
      )
  }

  updateIdRef(mapShape: IMarker | IPath) {
    if (EqMarker.isMarker(mapShape)) {
      return this.mapsService.updateMarkers(mapShape as IMarker);
    } else if (EqPath.isPath(mapShape)) {
      return this.mapsService.updatePath(mapShape as IPath);
    }
    return new Observable((subscriber: Subscriber<any>) => { subscriber.next() });

  }

  getColumns() {
    if (!this.mapElement) {
      return;
    }
    this.tableService.getAllColumns(this.mapElement.moduleRef, this.mapElement.tableRef)
      .subscribe(
        {
          next: (cData: any) => {
            this.columnMetadata = cData;
          },
          error: (error: any) => {
            console.log(error);
          }
        }
      )
  }

  getItemByRefId() {
    const idRef = this.mapShape?.idRef ? this.mapShape?.idRef : '';
    this.tableService.getRowById(this.mapElement.moduleRef, this.mapElement.tableRef, idRef)
      .subscribe(
        {
          next: (row: any) => {
            this.formItem = row;
            this.getColumns();
          },
          error: (error: any) => {
            console.log(error);
          }
        }
      )

  }

}
