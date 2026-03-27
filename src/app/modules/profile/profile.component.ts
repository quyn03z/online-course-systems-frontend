import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { RouterModule, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NotifySuccess, NotifyError, NotifyApiError } from '../../core/utils/notification.util';

declare var html2pdf: any;
declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, RouterLink],
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
  activeTab: string = 'info';
  purchaseHistory: any[] = [];

  // Certificate Preview
  certificateHtml: SafeHtml | null = null;
  certificateHtmlRaw: string = '';
  currentCertificateCourseId: number | null = null;
  isCertificateLoading = false;

  userService = inject(UserService);
  sanitizer = inject(DomSanitizer);

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
        const currentUserJson = JSON.parse(localStorage.getItem('current_user') ?? 'null');
        const userInfor = {
          username: this.user.username ?? currentUserJson?.username,
          avatar: this.avatar,
          role: currentUserJson?.role ?? '',
          permissions: currentUserJson?.permissions ?? []
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

  setView(tab: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = tab;
    if (tab === 'purchase') {
      this.getPurchaseHistory();
    }
  }

  getPurchaseHistory(): void {
    this.isLoading = true;
    this.userService.getPurchaseHistory().subscribe({
      next: (res) => {
        this.purchaseHistory = res.result;
        this.isLoading = false;

        // Load progress for each course
        this.purchaseHistory.forEach(item => {
          this.userService.getProgress(item.courseId).subscribe({
            next: (progressRes) => {
              item.progress = progressRes.result.progress;
              item.isCompleted = progressRes.result.isCompleted;
            },
            error: (err) => console.error('Lỗi lấy tiến độ:', err)
          });
        });
      },
      error: (err) => {
        NotifyApiError(err, 'Lấy lịch sử mua hàng thất bại.');
        this.isLoading = false;
      }
    });
  }

  openCertificateModal(courseId: number): void {
    this.isCertificateLoading = true;
    this.currentCertificateCourseId = courseId;
    this.certificateHtml = null;
    this.certificateHtmlRaw = '';

    const modalEl = document.getElementById('certificateModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    this.userService.downloadCertificate(courseId).subscribe({
      next: (res) => {
        try {
          const binaryString = atob(res.result);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const htmlContent = new TextDecoder().decode(bytes);
          this.certificateHtmlRaw = htmlContent;
          // bypassSecurityTrustHtml dùng cho srcdoc của iframe
          this.certificateHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
          this.isCertificateLoading = false;
        } catch (e) {
          console.error('Lỗi xử lý chứng chỉ:', e);
          this.isCertificateLoading = false;
          NotifyError('Có lỗi khi tải chứng chỉ. Vui lòng thử lại.');
        }
      },
      error: (err: any) => {
        this.isCertificateLoading = false;
        NotifyApiError(err, 'Tải chứng chỉ thất bại. Vui lòng thử lại.');
      }
    });
  }

  downloadCertificatePdf(): void {
    if (!this.currentCertificateCourseId || !this.certificateHtmlRaw) return;
    const courseId = this.currentCertificateCourseId;
    const options = {
      margin: 0,
      filename: `Chung_Chi_Hoan_Thanh_${courseId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: 'px', format: [800, 600], orientation: 'landscape' }
    };
    // Dùng raw HTML (có cả <head><style>) để đảm bảo giữ nguyên toàn bộ CSS
    html2pdf().from(this.certificateHtmlRaw).set(options).save();
    NotifySuccess('Đang xuất bản PDF, vui lòng chờ...');
  }

}
