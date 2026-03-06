import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiService = inject(ApiService);

  constructor() { }

  createPaymentMomo(orderInfo: any) {
    return this.apiService.post<any>('Payment/create-momo-payment', orderInfo);
  }

  verifyPayment(params: any) {
    return this.apiService.get<any>('Checkout/PaymentCallBack', params);
  }


}
