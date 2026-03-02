import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule,],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private authService: AuthService) { }

  onSendMail(): void {
    if (!this.email) {
      this.errorMessage = 'Vui lòng nhập email';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.successMessage = 'Đã gửi email thành công. Kiểm tra trong hộp thư đến của bạn.';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoading = false;
      }
    });
  }

}
