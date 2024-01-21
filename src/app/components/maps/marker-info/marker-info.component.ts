import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasModule, NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { IMarker } from '../Model/IMarker';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { IMapElement } from '../Model/IMapElement';
import { FormComponent } from '../../crud/form/form.component';
import { BrowserModule } from '@angular/platform-browser';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { MapsService } from '../maps.service';

@Component({
  selector: 'eq-marker-info',
  templateUrl: './marker-info.component.html',
  styleUrls: ['./marker-info.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgbTypeaheadModule,
    NgbOffcanvasModule,
    FormComponent
  ]
})
export class MarkerInfoComponent implements AfterViewInit {

  @ViewChild('content') content!: ElementRef;
  @Input() openPanel!: Subject<{ marker: IMarker, mapElement: IMapElement }>;

  mainLinst: any[] = [];
  mapElement!: IMapElement;
  marker!: IMarker;
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
      (data: { marker: IMarker, mapElement: IMapElement }) => {
        this.columnMetadata = undefined;
        this.formItem = undefined;
        this.offcanvasService.open(this.content, { position: 'end' });
        this.mapElement = data.mapElement;
        this.marker = data.marker;
        if (this.marker.idRef) {
          this.getItemByRefId();
        }
      }
    )
  }

  getTableData(mapElement: IMapElement, value: string) {
    return this.tableService.getRowsByColumnAndSimilarValue(mapElement?.moduleRef, mapElement?.tableRef, mapElement?.columnRef, value);
  }

  onSelectItem(event: any) {
    this.marker.idRef = event?.item?._id ? event.item._id : null;
    this.updateIdRef(this.marker)
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

  updateIdRef(marker: IMarker) {
    return this.mapsService.updateMarkers(marker);
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
    this.tableService.getRowById(this.mapElement.moduleRef, this.mapElement.tableRef, this.marker.idRef)
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
