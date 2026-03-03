import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
  errorMessage = '';
  successMessage = '';
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
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lấy thông tin người dùng thất bại. Vui lòng thử lại.';
      }
    })
  }

  onChangePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Mật khẩu mới và xác nhận mật khẩu mới không khớp.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.changePassword({ oldPassword: this.oldPassword, newPassword: this.newPassword, confirmNewPassword: this.confirmNewPassword }).subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.successMessage = 'Bạn đã đổi mật khẩu thành công!';
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      }
    })
  }

}
