import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isSignUp = false;

  // Sign In fields
  username = '';
  password = '';

  // Sign Up fields
  signUpUsername = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpConfirmPassword = '';

  // UI state
  isLoading = false;
  errorMessageLogin = '';
  errorMessageSignUp = '';
  successMessageSignUp = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSignIn(): void {
    if (!this.username || !this.password) {
      this.errorMessageLogin = 'Vui lòng nhập username và password.';
      return;
    }

    this.isLoading = true;
    this.errorMessageLogin = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessageLogin = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    });
  }

  onSignUp(): void {
    if (!this.signUpUsername || !this.signUpEmail || !this.signUpPassword) {
      this.errorMessageSignUp = 'Vui lòng nhập username, email và password.';
      return;
    }
    this.isLoading = true;
    this.errorMessageSignUp = '';
    this.successMessageSignUp = '';

    this.authService.signUp({ username: this.signUpUsername, email: this.signUpEmail, password: this.signUpPassword, confirmPassword: this.signUpConfirmPassword }).subscribe({
      next: (res) => {
        console.log('Dữ liệu API trả về:', res);
        this.successMessageSignUp = 'Bạn đã đăng ký thành công!';
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // Kiểm tra xem API có trả về mảng 'errors' hợp lệ hay không
        if (err.error && err.error.errors && err.error.errors.length > 0) {
          // Nối các câu lỗi lại thành một chuỗi duy nhất, cách nhau bằng khoảng trắng
          this.errorMessageSignUp = err.error.errors.join('\n');
        } else {
          // Thông báo dự phòng cho các trường hợp rớt mạng, lỗi 500 Server...
          this.errorMessageSignUp = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
      }
    })


  }

}
