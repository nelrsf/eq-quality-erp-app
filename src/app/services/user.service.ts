import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IUser } from "../Model/interfaces/IUser";
import { AuthService } from "../pages/auth/auth.service";
import { TablesService } from "../pages/tables/tables.service";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private currentUserSubject = new BehaviorSubject<IUser | null>(null);

    constructor(private authService: AuthService, private tableService: TablesService) {
        this.loadUser();
    }

    public loadUser(){
        const token = this.authService.getToken();
        if (token && !this.getUser()) {
            const id = this.getUserIdFromLocalStorage(token);
            this.getUserFromServer(id);
        }
    }


    private getUserIdFromLocalStorage(token: string) {
        const payload: any = atob(token.split('.')[1]);
        const JSONpayload = JSON.parse(payload);
        return JSONpayload.id;
    }


    getUserSubject(){
        return this.currentUserSubject;
    }

    getUser() {
        return this.currentUserSubject.getValue();
    }

    setUser(user: IUser | null) {
        this.currentUserSubject.next(user);
    }

    getUserFromServer(id: string) {
        this.tableService.getRowById('_eq__admin_manager', 'users', id)
            .subscribe(
                ((data: any) => {
                    this.currentUserSubject.next(
                        {
                            _id: data._id,
                            email: data.Email,
                            name: data.Nombre,
                            image: data.Imagen ? data.Imagen : 'https://bootdey.com/img/Content/avatar/avatar7.png'
                        }
                    )
                })
            )
    }

    saveUser(user: IUser){
        const module = environment.adminTables.mainUsersModule;
        const table = environment.adminTables.mainUsersTable;
        const userRow = {
            _id: user._id,
            Email: user.email,
            Nombre: user.name,
            Imagen: user.image
        }
        return this.tableService.updateRows(module, table, [userRow]);
    }

}