import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { IUser } from "src/app/Model/interfaces/IUser";
import { PermissionsService } from "src/app/services/permissions.service";
import { UserService } from "src/app/services/user.service";

@Directive({
    selector: '[showIfCanEdit]',
    standalone: true
})
export class ShowIfCanEdit implements OnInit {

    @Input() showIfCanEdit!: { table: string, module: string };


    constructor(public elementRef: ElementRef, private permissionsService: PermissionsService, private userService: UserService) { }

    ngOnInit(): void {
        this.elementRef.nativeElement.style.display = 'none';
        if (!this.showIfCanEdit) {
            return;
        }
        let table = this.showIfCanEdit.table;
        let module = this.showIfCanEdit.module;

        this.userService.getUserSubject()
            .subscribe(
                {
                    next: (user: IUser | null) => {
                        if (!user) {
                            return
                        }
                        this.permissionsService.getUserProfile(module, user,
                            (profile: any) => {
                                this.permissionsService.getTableData(table, module, profile, this.getTableCallback)
                            }

                        )
                    }
                }
            )
    }

    getTableCallback = (profile: any, table: any) => {
        const editPermissions = table?.table_metadata?.permissions?.edit;
        if (!editPermissions) {
            return;
        }
        if (editPermissions.includes(profile._id)) {
            this.elementRef.nativeElement.style.display = 'block'
        }
    };

}