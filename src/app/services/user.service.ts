import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IUser } from "../Model/interfaces/IUser";
import { AuthService } from "../pages/auth/auth.service";
import { TablesService } from "../pages/tables/tables.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private currentUserSubject = new BehaviorSubject<IUser | null>(null);

    constructor(private authService: AuthService, private tableService: TablesService) {
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

    setUser(user: IUser) {
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
                            name: data.Nombre
                        }
                    )
                })
            )
    }

}