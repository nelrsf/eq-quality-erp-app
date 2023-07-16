import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { filter } from "rxjs";
import { IModule } from "src/app/Model/interfaces/IModule";
import { ITable } from "src/app/Model/interfaces/ITable";
import { IUser } from "src/app/Model/interfaces/IUser";
import { ModulesService } from "src/app/pages/modules/modules.service";
import { TablesService } from "src/app/pages/tables/tables.service";
import { PermissionsService } from "src/app/services/permissions.service";
import { UserService } from "src/app/services/user.service";

@Directive({
    selector: '[showIfIsOwner]',
    standalone: true
})
export class showIfIsOwner implements OnInit {

    @Input() showIfIsOwner!: string;

    constructor(public elementRef: ElementRef, private userService: UserService, private permissionsService: PermissionsService) { }

    ngOnInit(): void {
        this.elementRef.nativeElement.style.display = 'none';
        if (!this.showIfIsOwner) {
            return;
        }
        let moduleName = this.showIfIsOwner;
        this.userService.getUserSubject()
            .subscribe(
                {
                    next: (user: IUser | null) => {
                        if (!user) {
                            return;
                        };
                        this.permissionsService.getModuleData(moduleName, user, this.getModuleDataCallback);
                    }
                }
            )

    }

    getModuleDataCallback = (user: IUser, module: IModule) => {
        if (user._id === module?.owner) {
            this.elementRef.nativeElement.style.display = 'block';
        }
    }

    // getModuleData(moduleName: string, user: IUser) {
    //     this.moduleService.getModuleByName(moduleName)
    //         .subscribe({
    //             next: (module: any) => {
    //                 if (user._id === module?.owner) {
    //                     this.elementRef.nativeElement.style.display = 'block';
    //                 }
    //             }
    //         })
    // }
}