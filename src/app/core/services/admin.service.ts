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

  getAllUsers(page: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.apiService.get<any>('Admin/get-all-users', params);
  }

  updateUser(user: any) {
    return this.apiService.put<any>('Admin/edit-user-admin', user);
  }

  createUser(user: any) {
    return this.apiService.post<any>('Admin/create-user-admin', user);
  }

}
