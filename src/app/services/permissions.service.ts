import { Injectable } from "@angular/core";
import { UserService } from "./user.service";
import { IUser } from "../Model/interfaces/IUser";
import { TablesService } from "../pages/tables/tables.service";
import { Observable, Subscriber } from "rxjs";
import { ModulesService } from "../pages/modules/modules.service";
import { IModule } from "../Model/interfaces/IModule";

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    constructor(private userService: UserService, private tablesService: TablesService, private modulesService: ModulesService) { }

    isAdmin(module: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<unknown>) => {
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    return;
                }
                this.getUserProfile(module, user,
                    (data) => {
                        if (data.EsAdmin) {
                            subscriber.next(true);
                        } else {
                            subscriber.next(false);
                        }
                    });
            }
        )
    }

    isOwner(module: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<unknown>) => {
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    return;
                }
                this.getModuleData(module, user,
                    (user: IUser, module: IModule) => {
                        if (user._id === module?.owner) {
                            subscriber.next(true);
                        } else {
                            subscriber.next(false);
                        }
                    }
                )
            }
        );
    }


    getUserProfile(module: string, user: IUser, callback: (...data: any) => void) {
        this.tablesService.getRowsByColumnAndValue(module, '__users_module_table__', 'Email', user.email)
            .subscribe(
                (data: any) => {
                    if (data.length !== 0) {
                        this.getProfileData(module, data[0].Perfil, callback);
                    }
                }
            )
    }

    getProfileData(module: string, profile: string, callback: (...args: any) => void) {
        this.tablesService.getRowsByColumnAndValue(module, '__profiles_module_table__', 'Nombre', profile)
            .subscribe({
                next: (data: any) => {
                    if (data.length > 0) {
                        callback(data[0]);
                    } else {
                        callback({});
                    }

                }
            })
    }

    getModuleData(moduleName: string, user: IUser, callback: (...data: any) => void) {
        this.modulesService.getModuleByName(moduleName)
            .subscribe({
                next: (module: any) => {
                    callback(user, module);
                }
            })
    }


}