import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  token: string = '';

  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    console.log('Token lấy được:', this.token);
  }

  onResetPassword(): void {
    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập password và confirm password.';
      return;
    }

    this.authService.resetPassword(this.password, this.confirmPassword, this.token).subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.successMessage = 'Bạn đã reset password thành công!';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Reset password thất bại. Vui lòng thử lại.';
      }
    })
  }



}
