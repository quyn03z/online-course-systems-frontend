import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';


export interface ChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}


@Injectable({
  providedIn: 'root'
})


export class UserService {

  private apiService = inject(ApiService);

  changePassword(model: ChangePasswordModel): Observable<any> {
    return this.apiService.put<any>(`User/change-password`, model);
  }

  getUserById(): Observable<any> {
    return this.apiService.get<any>(`User/user-profile`);
  }

  updateProfile(model: any): Observable<any> {
    return this.apiService.put<any>(`User/update-profile`, model);
  }

  getPurchaseHistory(): Observable<any> {
    return this.apiService.get<any>(`User/purchase-history`);
  }

  getProgress(courseId: number): Observable<any> {
    return this.apiService.get<any>(`MenteeScore/get-progress/${courseId}`);
  }

  downloadCertificate(courseId: number): Observable<any> {
    return this.apiService.get<any>(`Certificate/download/${courseId}`);
  }




}
