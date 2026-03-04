import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);

  constructor() { }

  getAllUsers(page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.apiService.get<any>('Admin/get-all-users', params);
  }

  updateUser(user: any) {
    return this.apiService.put<any>('Admin/edit-user-admin', user);
  }

}
