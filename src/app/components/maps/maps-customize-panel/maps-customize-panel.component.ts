import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { NgbAccordion, NgbAccordionModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapsService } from '../maps.service';
import { IMapElement } from '../Model/IMapElement';
import { ColumnSelector } from '../../crud/column-customizer/columnSelector/column-selector.component';
import { FormsModule } from '@angular/forms';
import { IModule } from 'src/app/Model/interfaces/IModule';
import { ITable } from 'src/app/Model/interfaces/ITable';
import { IColumn } from 'src/app/Model/interfaces/IColumn';
import { Subject } from 'rxjs';
import { ShowIfIsAdmin } from 'src/app/directives/permissions/show-if-is-admin.directive';
import { ShowIfIsOwner } from 'src/app/directives/permissions/show-if-is-owner.directive';
import { ShowIfCanEdit } from 'src/app/directives/permissions/show-if-can-edit.directive';

@Component({
  selector: 'eq-maps-customize-panel',
  templateUrl: './maps-customize-panel.component.html',
  styleUrls: ['./maps-customize-panel.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ColumnSelector,
    NgbAccordionModule,
    FormsModule,
    ShowIfIsAdmin,
    ShowIfIsOwner,
    ShowIfCanEdit
  ]
})
export class MapsCustomizePanelComponent implements OnInit {

  @Output() onInsertMarker: EventEmitter<IMapElement> = new EventEmitter();
  @Output() onGetMapIcons: EventEmitter<any> = new EventEmitter();
  @Output() onGetMapElements: EventEmitter<IMapElement[]> = new EventEmitter();
  @Input() closePanel!: Subject<void>;
  @Input() module!: string;
  @Input() table!: string;

  icons = {
    config: faCog
  }
  mapElements: IMapElement[] = [];
  mapIcons: any[] = [];
  newElement: IMapElement = {
    columnRef: '',
    icon: 1,
    moduleRef: '',
    name: 'Nuevo elemento',
    tableRef: '',
    type: 'point',
    pathColor: '#006B25',
    pathStroke: 3
    
  };


  constructor(private offcanvasService: NgbOffcanvas, private mapsService: MapsService) { }

  ngOnInit(): void {
    this.setClosePanelSubject();
    this.getMapElements();
    this.getMapIcons();
  }

  setClosePanelSubject() {
    if (!this.closePanel) {
      return;
    }
    this.closePanel.subscribe(
      () => {
        this.offcanvasService.dismiss();
      }
    )
  }

  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
    this.getMapElements();
    this.getMapIcons();
  }


  getMapElements() {
    this.mapsService.getMapElements()
      .subscribe({
        next: (data: any) => {
          this.mapElements = data;
          this.onGetMapElements.emit(this.mapElements);
        },
        error: (error: any) => {
          console.log(error);
        }
      })
  }

  setSelectorData(mapElement: IMapElement) {
    return {
      module: mapElement.moduleRef ? mapElement.moduleRef : '',
      table: mapElement.tableRef ? mapElement.tableRef : '',
      column: mapElement.columnRef ? mapElement.columnRef : ''
    }
  }

  saveMapElement(mapElement: IMapElement) {
    this.mapsService.updateMapElements(mapElement)
      .subscribe(
        {
          next: () => {
            this.getMapElements();
          },
          error: (error) => {
            console.log(error)
          }
        }
      )
  }

  deleteMapElement(mapElement: IMapElement) {
    this.mapsService.deleteMapElements(mapElement)
      .subscribe(
        {
          next: () => {
            this.getMapElements();
          },
          error: (error) => {
            console.log(error)
          }
        }
      )
  }

  createMapElement(mapElement: IMapElement, createAccordion: any) {
    this.mapsService.createMapElements(mapElement)
      .subscribe(
        {
          next: () => {
            this.getMapElements();
            createAccordion.collapseAll();
          },
          error: (error) => {
            console.log(error);
            createAccordion.collapseAll();
          }
        }
      )
  }


  getMapIcons() {
    this.mapsService.getMapIcons()
      .subscribe(
        {
          next: (icons: any) => {
            this.mapIcons = icons;
            this.onGetMapIcons.emit(this.mapIcons);
          },
          error: (error) => {
            console.log(error);
          }
        }
      )
  }

  onSelectIcon(newElement: IMapElement, icon: any) {
    newElement.icon = icon.id;
  }

  getButtonIcon(iconId: number) {
    const icon = this.mapIcons.find(
      (i) => {
        return i.id === iconId;
      }
    );
    if (!icon) {
      return '';
    }
    return icon.url;
  }

  setModule(module: IModule, item: IMapElement) {
    item.moduleRef = module.name;
  }

  setTable(table: ITable, item: IMapElement) {
    item.tableRef = table.name ? table.name : '';
  }

  setColumn(column: IColumn, item: IMapElement) {
    item.columnRef = column._id;
  }

  insertMarker(mapElement: IMapElement) {
    this.onInsertMarker.emit(mapElement);
  }

}
