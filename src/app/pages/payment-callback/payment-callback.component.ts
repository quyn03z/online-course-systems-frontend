import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { LessonsService } from '../../core/services/lessons.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-callback.component.html',
  styleUrl: './payment-callback.component.scss'
})
export class PaymentCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private lessonsService = inject(LessonsService);

  status: 'loading' | 'success' | 'error' = 'loading';
  message: string = 'Đang xác thực giao dịch...';
  lessonId: string | null = null;

  paymentData: any = {};

  ngOnInit(): void {
    // Lấy toàn bộ query params từ URL
    this.route.queryParams.subscribe(params => {
      this.paymentData = params;
      this.verifyPayment(params);
    });
  }

  verifyPayment(params: any): void {
    this.paymentService.verifyPayment(params).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.status = 'success';
          this.message = res.message || 'Thanh toán thành công!';
          // Lấy lessonId đầu tiên để chuyển hướng
          if (this.courseId) {
            this.lessonsService.getFirstLessonIdByCourseId(this.courseId.toString()).subscribe({
              next: (lres) => {
                if (lres.succeeded && lres.result) {
                  this.lessonId = lres.result.toString();
                }
              }
            });
          }
        } else {
          this.status = 'error';
          this.message = res.message || 'Thanh toán thất bại.';
        }
      },
      error: (err) => {
        console.log(err);
        this.status = 'error';
        this.message = err.error?.message || 'Có lỗi xảy ra trong quá trình xác thực.';
        console.error('Lỗi xác thực thanh toán:', err);
      }
    });
  }


  get courseId(): number {
    if (!this.paymentData.extraData) return 0;
    try {
      // giải mã base64
      const decodedData = atob(this.paymentData.extraData);
      return Number(decodedData) || 0;
    } catch (e) {
      return 0;
    }
  }


}
