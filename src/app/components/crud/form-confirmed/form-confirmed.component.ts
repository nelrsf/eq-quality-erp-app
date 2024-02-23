import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ColumnTypes, IColumn } from "src/app/Model/interfaces/IColumn";
import { LoadingComponent } from "../../miscelaneous/loading/loading.component";
import { TablesService } from "src/app/pages/tables/tables.service";
import { Observable, concatMap, from, of } from "rxjs";
import { ICellRestriction } from "src/app/Model/interfaces/ICellRestrictions";
import { environment } from "src/environments/environment";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'eq-form-confirmed',
    templateUrl: 'form-confirmed.component.html',
    styleUrls: ['form-confirmed.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        LoadingComponent,
        FontAwesomeModule
    ]
})
export class FormConfirmedComponent implements OnInit {


    @ViewChild('FormContainer')formContainer!: ElementRef;

    COLUMN_TYPES_ENUM = ColumnTypes;
    row: any;
    columns: Array<any> = [];
    module!: string;
    table!: string;
    loading: boolean = false;
    filesUrl = environment.filesUrl + '/download/';
    icons = {
        share: faShare
    }

    constructor(private tableService: TablesService) { }

    ngOnInit(): void {
        this.row = history.state['row'];
        this.columns = history.state['columns'];
        this.module = history.state['module'];
        this.table = history.state['table'];
        const restriction = history.state['restriction'];

        if (!this.row?._id || !this.columns) {
            return
        }

        this.loading = true;
        this.tableService.getRowById(this.module, this.table, this.row._id)
            .subscribe(
                {
                    next: (newRow: any) => {
                        this.row = newRow;
                        this.getRestrictedFields(this.row._id, restriction)
                        this.loading = false;
                    },
                    error: (error: any) => {
                        console.log(error);
                    }
                }
            )

    }

    getRestrictedFields(rowId: string, restriction: Array<ICellRestriction>) {
        const restrictedColumnsObs = from(restriction);
        restrictedColumnsObs.pipe(
            concatMap(
                (cr: ICellRestriction) => {
                    if (!cr?.column.moduleRestriction || !cr?.column.tableRestriction) {
                        return of('')
                    }
                    if (!cr.rowIdRestriction) {
                        return of('')
                    }
                    return this.tableService.getRowById(cr.column.moduleRestriction, cr.column.tableRestriction, cr.rowIdRestriction);
                }
            )
        ).subscribe(
            {
                next: (result: any) => {
                    restriction.forEach(
                        (f: ICellRestriction) => {
                            if(!result){
                                return;
                            }
                            this.row[f.column.columnRestriction as string] =  result[f.column.columnRestriction as string];
                        })
                    this.loading = false;
                },
                error: (error: any) => {
                    console.log(error);
                    this.loading = false;
                },
                complete: () => {
                    this.loading = false;
                }
            }
        )
    }

    shareRow(){
        const text = this.formContainer.nativeElement.innerText;
        navigator.share({
            text: text
        })
    }
}