import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultResponse } from './course.service';

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
    return this.apiService.put<ResultResponse<any>>('Admin/edit-user-admin', user);
  }

  createUser(user: any) {
    return this.apiService.post<ResultResponse<any>>('Admin/create-user-admin', user);
  }

  getAllRoles() {
    return this.apiService.get<ResultResponse<any>>('Role/get-alls-role');
  }

  updateRole(role: any, roleId: number) {
    return this.apiService.put<ResultResponse<any>>(`Role/update-role/${roleId}`, role);
  }

  createRole(role: any) {
    return this.apiService.post<ResultResponse<any>>('Role/create-role', role);
  }

  deleteRole(roleId: number) {
    return this.apiService.delete<ResultResponse<any>>(`Role/delete-role/${roleId}`);
  }


  getInforDashboard() {
    return this.apiService.get<ResultResponse<any>>('Admin/infor-dashboard');
  }



  getChartDashboard() {
    return this.apiService.get<ResultResponse<any>>('Admin/chart-dashboard');
  }
}
