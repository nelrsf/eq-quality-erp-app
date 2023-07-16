import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faFolder, faTable, faTurnUp } from "@fortawesome/free-solid-svg-icons";
import { ITable } from "src/app/Model/interfaces/ITable";
import { TablesService } from "src/app/pages/tables/tables.service";
import { ErrorComponent } from "../alerts/error/error.component";
import { LoadingComponent } from "../miscelaneous/loading/loading.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Router } from "@angular/router";

@Component({
    selector: 'eq-navigator',
    templateUrl: './navigator.component.html',
    styleUrls: ['./navigator.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule,
        ErrorComponent,
        LoadingComponent,
        BreadcrumbComponent
    ]
})
export class NavigatorComponent implements OnInit {

    constructor(private tablesService: TablesService, private ngbModal: NgbModal, private router: Router) { }

    errorMessage: string = "";
    loading: boolean = false;
    mainRoute: string = "";

    @ViewChild('modalError') modalError!: ElementRef;
    @Input() data!: ITable[];
    @Input() moduleName!: string;
    @Input() item!: ITable;


    icons = {
        table: faTable,
        folder: faFolder,
        upToFolder: faTurnUp
    }

    ngOnInit(): void {
        this.setMainRoute();
    }

    closeModal() {
        if (this.ngbModal.hasOpenModals()) {
            this.ngbModal.dismissAll();
        }
    }

    openErrorModal() {
        this.ngbModal.open(this.modalError);
    }

    setMainRoute() {
        if (this.data[0].route) {
            this.mainRoute = this.data[0].route;
        }
    }

    upFolder() {
        let route;
        const segments = this.mainRoute.split('/');
        if (segments.length < 2) {
            route = "";
        } else {
            route = segments[segments.length - 2];
        }
        this.tablesService.getTablesByRoute(this.moduleName, route)
            .subscribe(
                {
                    next: (data: any) => {
                        this.data = data;
                        this.setMainRoute();
                        this.loading = false;
                    },
                    error: (error) => {
                        this.loading = false;
                        this.errorMessage = error.message;
                        this.openErrorModal();
                        console.log(error);
                    }
                }
            )
    }

    downFolder(item: ITable) {
        this.loading = true;
        const routeParam = item.routeParam ? item.routeParam : '';
        this.mainRoute = item.route && item.route !== '/' ? item.route + '/' + routeParam : routeParam;

        this.tablesService.getTablesByRoute(this.moduleName, routeParam)
            .subscribe(
                {
                    next: (data: any) => {
                        this.data = data;
                        this.loading = false;
                    },
                    error: (error) => {
                        this.loading = false;
                        this.errorMessage = error.message;
                        this.openErrorModal();
                        console.log(error);
                    }
                }
            )

    }

    getRouteString() {
        return this.mainRoute;
    }

    updateTable() {
        this.loading = true;
        this.item.route = this.mainRoute;
        this.tablesService.customizeTable(this.moduleName, this.item)
            .subscribe(
                {
                    next: (data) => {
                        console.log(data);
                        this.loading = false;
                        this.closeModal();
                        this.refreshTables();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.errorMessage = error.message;
                        this.openErrorModal();
                        console.log(error);
                    }
                }
            );
    }

    refreshTables() {
        let lastSegment; 
        if(this.mainRoute && this.mainRoute !== '/'){
            const segments = this.mainRoute.split('/');
            lastSegment = segments[segments.length - 1];
        } else {
            lastSegment = '';
        }

        this.router.navigate([ '/tables/' + this.moduleName + '/' + lastSegment]);

    }

}