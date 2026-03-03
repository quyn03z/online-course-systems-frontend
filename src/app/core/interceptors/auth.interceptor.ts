import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Đính kèm access token vào header (trừ request refresh-token để tránh vòng lặp)
    const isRefreshRequest = req.url.includes('Auth/refresh-token');
    const isLogoutRequest = req.url.includes('Auth/logout');
    const clonedReq = token && !isRefreshRequest
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Nếu 401 và không phải chính request refresh-token hoặc logout → thử refresh
            if (error.status === 401 && !isRefreshRequest && !isLogoutRequest && authService.getRefreshToken()) {
                return authService.handleRefreshToken().pipe(
                    switchMap(newToken => {
                        // Retry request gốc với token mới
                        const retried = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retried);
                    }),
                    catchError(refreshError => {
                        // Refresh thất bại → logout
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
