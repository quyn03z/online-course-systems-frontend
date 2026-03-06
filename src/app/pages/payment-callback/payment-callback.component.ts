import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

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

  status: 'loading' | 'success' | 'error' = 'loading';
  message: string = 'Đang xác thực giao dịch...';

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
      const decodedData = atob(this.paymentData.extraData);
      return Number(decodedData) || 0;
    } catch (e) {
      return 0;
    }
  }


}
