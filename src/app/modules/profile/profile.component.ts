import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotifySuccess, NotifyError, NotifyApiError } from '../../core/utils/notification.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

export class ProfileComponent implements OnInit {

  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  isLoading = false;
  firstName = '';
  lastName = '';
  avatar = '';
  user: any;



  userService = inject(UserService);

  constructor() { }

  ngOnInit(): void {
    this.getUserById();
  }


  getUserById(): void {
    this.userService.getUserById().subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.user = res.result;
        this.firstName = res.result.firstName;
        this.lastName = res.result.lastName;
        this.avatar = res.result.avatar;
      },
      error: (err: any) => {
        NotifyApiError(err, 'Lấy thông tin người dùng thất bại.');
      }
    });
  }

  onChangePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      NotifyError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      NotifyError('Mật khẩu mới và xác nhận mật khẩu mới không khớp.');
      return;
    }
    this.isLoading = true;

    this.userService.changePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    }).subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.isLoading = false;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        NotifySuccess('Bạn đã đổi mật khẩu thành công!');
      },
      error: (err: any) => {
        this.isLoading = false;
        NotifyApiError(err, 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
    });
  }

  onUpdateProfile(): void {
    this.isLoading = true;

    this.userService.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar
    }).subscribe({
      next: (res: any) => {
        console.log('Dữ liệu API trả về:', res);
        this.isLoading = false;
        if (this.user) {
          this.user.avatar = this.avatar;
        }
        const userInfor = {
          username: this.user.username,
          avatar: this.avatar
        }
        localStorage.setItem('current_user', JSON.stringify(userInfor));
        NotifySuccess('Bạn đã cập nhật thông tin thành công!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        NotifyApiError(err, 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
      }
    });
  }


}
