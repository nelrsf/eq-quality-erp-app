import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { IModule } from "src/app/Model/interfaces/IModule";
import { IUser } from "src/app/Model/interfaces/IUser";
import { PermissionsService } from "src/app/services/permissions.service";
import { UserService } from "src/app/services/user.service";

@Directive({
    selector: '[showIfIsOwner]',
    standalone: true
})
export class ShowIfIsOwner implements OnInit, OnChanges {

    @Input() showIfIsOwner!: string;

    constructor(public elementRef: ElementRef, private userService: UserService, private permissionsService: PermissionsService) { }
    
    ngOnChanges(changes: SimpleChanges): void {
        if(changes['showIfIsOwner']){
            this.initializeDirective();
        }
    }



    ngOnInit(): void {
        this.initializeDirective();
    }

    initializeDirective(){
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