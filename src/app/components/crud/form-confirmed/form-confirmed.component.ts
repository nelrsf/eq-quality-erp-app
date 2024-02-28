import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
    columns: Array<IColumn> = [];
    module!: string;
    table!: string;
    loading: boolean = false;
    filesUrl = environment.filesUrl + '/download/';
    icons = {
        share: faShare
    }

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.row = history.state['row'];
        this.columns = history.state['columns'];
        this.module = history.state['module'];
        this.table = history.state['table'];

    }


    shareRow(){
        const text = this.formContainer.nativeElement.innerText;
        navigator.share({
            text: text
        })
    }

    goToNewForm(){
        const newFormMuRL = '/form/' + this.module + '/' + this.table;
        this.router.navigate([newFormMuRL])
    }
}