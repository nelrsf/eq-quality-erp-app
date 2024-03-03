import { Injectable } from "@angular/core";
import { UserService } from "./user.service";
import { IUser } from "../Model/interfaces/IUser";
import { TablesService } from "../pages/tables/tables.service";
import { Observable, Subscriber, catchError, forkJoin, map, of, switchMap, take } from "rxjs";
import { ModulesService } from "../pages/modules/modules.service";
import { IModule } from "../Model/interfaces/IModule";
import { environment } from "src/environments/environment";
import { error } from "console";
import { IColumn } from "../Model/interfaces/IColumn";

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    usersTable: string = environment.adminTables.users;
    profilesTable: string = environment.adminTables.profile;

    constructor(private userService: UserService, private tablesService: TablesService, private modulesService: ModulesService) { }

    canEditColumn(module: string, table: string, column: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<any>) => {
                if (!table || !column) {
                    subscriber.next(false);
                    subscriber.complete();
                    return;
                }
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    subscriber.complete();
                    return;
                }
                const profileObs = this.tablesService.getRowsByColumnAndValue(module, this.usersTable, 'Email', user.email)
                    .pipe(
                        switchMap(
                            (userObj: any) => {
                                return this.tablesService.getRowsByColumnAndValue(module, this.profilesTable, 'Nombre', userObj[0]?.Perfil);
                            }
                        ),
                        catchError(
                            (error: any) => {
                                console.log(error);
                                throw Error;
                            }
                        )
                    );

                const columnObserver = profileObs.pipe(
                    switchMap(
                        (profile: any) => {
                            const columnObs = this.tablesService.getColumnData(module, table, column);
                            return columnObs.pipe(
                                map((col: any) => {
                                    return {
                                        column: col,
                                        profile: profile[0]
                                    }
                                })
                            );
                        }
                    )
                );

                columnObserver.subscribe(
                    {
                        next: (result: any) => {
                            const columnResult = result.column;
                            const profileReult = result.profile;
                            const columnEditPermissions = columnResult?.permissions?.edit;
                            if (!columnEditPermissions) {
                                subscriber.next(false);
                                subscriber.complete();
                                return;
                            }
                            if (columnEditPermissions?.includes(profileReult?._id)) {
                                subscriber.next(true);
                            } else {
                                subscriber.next(false);
                            }
                            subscriber.complete();
                        },
                        error: (error: any) => {
                            console.log(error);
                            subscriber.next(false);
                            subscriber.complete();
                        }
                    }
                );
            }
        );

    }

    canEditTable(module: string, table: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<unknown>) => {
                if (!table) {
                    subscriber.next(false);
                    return;
                }
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    return;
                }
                this.getUserProfile(module, user,
                    (profile: any) => {
                        this.getTableData(table, module, profile,
                            (_user: IUser, table: any) => {
                                const tableEditPermissions = table?.table_metadata?.permissions?.edit;
                                if (!tableEditPermissions) {
                                    subscriber.next(false);
                                    return;
                                }
                                if (tableEditPermissions?.includes(profile._id)) {
                                    subscriber.next(true);
                                    return;
                                } else {
                                    subscriber.next(false);
                                    return;
                                }
                            }
                        )
                    });
            }
        )
    }

    canDeleteTable(module: string, table: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<unknown>) => {
                if (!table) {
                    subscriber.next(false);
                    return;
                }
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    return;
                }
                this.getUserProfile(module, user,
                    (profile: any) => {
                        this.getTableData(table, module, profile,
                            (_user: IUser, table: any) => {
                                const tableDeletePermissions = table?.table_metadata?.permissions?.delete;
                                if (!tableDeletePermissions) {
                                    subscriber.next(false);
                                    return;
                                }
                                if (tableDeletePermissions?.includes(profile._id)) {
                                    subscriber.next(true);
                                    return;
                                } else {
                                    subscriber.next(false);
                                    return;
                                }
                            }
                        )
                    });
            }
        )
    }

    canEdit(module: string): Observable<boolean> {
        return new Observable<boolean>(
            (subscriber: Subscriber<unknown>) => {
                const user = this.userService.getUser();
                if (!user) {
                    subscriber.next(false);
                    return;
                }
                this.getUserProfile(module, user,
                    (profile: any) => {
                        this.getModuleData(module, user,
                            (_user: IUser, module: any) => {
                                const edit = module?.permissions?.edit;
                                if (!edit) {
                                    subscriber.next(false);
                                    return;
                                }
                                if (edit.includes(profile._id)) {
                                    subscriber.next(true);
                                } else {
                                    subscriber.next(false);
                                }
                            }
                        )
                    });
            }
        )
    }

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
        this.tablesService.getRowsByColumnAndValue(module, this.usersTable, 'Email', user.email)
            .subscribe(
                {
                    next: (data: any) => {
                        if (data.length !== 0) {
                            this.getProfileData(module, data[0].Perfil, callback);
                        }
                    },
                    error: (error: any) => {
                        console.log(error)
                    }
                }
            )
    }

    getProfileData(module: string, profile: string, callback: (...args: any) => void) {
        this.tablesService.getRowsByColumnAndValue(module, this.profilesTable, 'Nombre', profile)
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

    getTableData(tableName: string, moduleName: string, profile: any, callback: (...data: any) => void) {
        this.tablesService.getTableObjectMetadata(moduleName, tableName)
            .subscribe({
                next: (tableData: any) => {
                    callback(profile, tableData);
                }
            })
    }

    setEditableColumns(columns: Array<IColumn>) {
        const colEditObsv: Array<Observable<{ value: boolean, column: string }>> = [];
        columns.forEach(
                (col: IColumn) => {
                    if(!col.module || !col.table){
                        colEditObsv.push(of({ value: true, column: col._id }));
                        return;
                    }
                    const combinedObservable: Observable<{ value: boolean, column: string }> = this.isOwner(col.module).pipe(
                        take(1),
                        switchMap(isOwner => {
                            if (isOwner) {
                                return of(true);
                            } else {
                                return this.canEditColumn(col.module, col.table, col._id);
                            }
                        }),
                        map((value: boolean) => {
                            return { value: value, column: col._id }
                        })
                    );
                    colEditObsv.push(combinedObservable)
                }
            )
        return forkJoin(colEditObsv);
    }


}