import { Directive, ElementRef, Injectable, Input, OnInit } from "@angular/core";
import { IModule } from "src/app/Model/interfaces/IModule";
import { ITable } from "src/app/Model/interfaces/ITable";
import { IUser } from "src/app/Model/interfaces/IUser";
import { TablesService } from "src/app/pages/tables/tables.service";
import { PermissionsService } from "src/app/services/permissions.service";
import { UserService } from "src/app/services/user.service";

@Directive({
    selector: '[showIfIsAdmin]',
    standalone: true
})
export class ShowIfIsAdmin implements OnInit {

    @Input() showIfIsAdmin!: string;


    constructor(public elementRef: ElementRef, private permissionsService: PermissionsService, private userService: UserService) { }

    ngOnInit(): void {
        this.elementRef.nativeElement.style.display = 'none';
        if (!this.showIfIsAdmin) {
            return;
        }
        let module = this.showIfIsAdmin;

        this.userService.getUserSubject()
            .subscribe(
                {
                    next: (user: IUser | null) => {
                        if (!user) {
                            return
                        }
                        this.permissionsService.getUserProfile(module, user, this.getUserProfileCallback);
                    }
                }
            )
    }

    getUserProfileCallback = (data: any) => {
        if (data.EsAdmin) {
            this.elementRef.nativeElement.style.display = 'block'
        }
    }

    // getUserProfile(module: string, user: IUser) {
    //     this.tablesService.getRowsByColumnAndValue(module, '__users_module_table__', 'Email', user.email)
    //         .subscribe(
    //             (data: any) => {
    //                 if (data.length !== 0) {
    //                     this.getProfileData(module, data[0].Perfil);
    //                 }
    //             }
    //         )
    // }

    // getProfileData(module: string, profile: string) {
    //     this.tablesService.getRowsByColumnAndValue(module, '__profiles_module_table__', 'Nombre', profile)
    //         .subscribe({
    //             next: (data: any) => {
    //                 const isAdmin = data[0].EsAdmin;
    //                 if (isAdmin) {
    //                     this.elementRef.nativeElement.style.display = 'block'
    //                 }
    //             }
    //         })
    // }
}