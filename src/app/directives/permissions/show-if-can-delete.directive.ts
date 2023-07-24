import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { IUser } from "src/app/Model/interfaces/IUser";
import { PermissionsService } from "src/app/services/permissions.service";
import { UserService } from "src/app/services/user.service";

@Directive({
    selector: '[showIfCanDelete]',
    standalone: true
})
export class ShowIfCanDelete implements OnInit {

    @Input() showIfCanDelete!: { table: string, module: string };


    constructor(public elementRef: ElementRef, private permissionsService: PermissionsService, private userService: UserService) { }

    ngOnInit(): void {
        this.elementRef.nativeElement.style.display = 'none';
        if (!this.showIfCanDelete) {
            return;
        }
        let table = this.showIfCanDelete.table;
        let module = this.showIfCanDelete.module;

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
        const deletePermissions = table?.table_metadata?.permissions?.delete;
        if (!deletePermissions) {
            return;
        }
        if (deletePermissions.includes(profile._id)) {
            this.elementRef.nativeElement.style.display = 'block'
        }
    };

}