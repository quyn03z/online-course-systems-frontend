import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResult {
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    role: string;
}

export interface LoginResponse {
    succeeded: boolean;
    result: LoginResult;
    errors: string[];
}

export interface TokenRequest {
    accessToken: string;
    refreshToken: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private router = inject(Router);
    private apiService = inject(ApiService);

    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    // Dùng để queue các request đang chờ khi đang refresh token
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor() { }

    // ── Login ──────────────────────────────────────────────────────────────────

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.apiService.post<LoginResponse>('Auth/login', credentials).pipe(
            tap(response => {
                if (response?.result) {
                    this.saveTokens(response.result.token, response.result.refreshToken);
                }
            })
        );
    }

    // ── Token Storage ──────────────────────────────────────────────────────────

    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        this.router.navigate(['/login']);
    }

    // ── Refresh Token ──────────────────────────────────────────────────────────

    /**
     * Gọi API refresh-token và lưu token mới vào localStorage.
     * Trả về Observable<LoginResponse> để interceptor có thể retry request gốc.
     */
    refreshToken(): Observable<LoginResponse> {
        const accessToken = this.getToken() ?? '';
        const refreshToken = this.getRefreshToken() ?? '';

        return this.apiService.post<LoginResponse>('Auth/refresh-token', {
            accessToken,
            refreshToken
        } as TokenRequest).pipe(
            tap(response => {
                if (response?.result) {
                    this.saveTokens(response.result.token, response.result.refreshToken);
                    this.refreshTokenSubject.next(response.result.token); a
                }
            }),
            catchError(err => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    /**
     * Dùng bởi interceptor: đảm bảo chỉ có 1 refresh đang chạy tại 1 thời điểm.
     * Các request khác sẽ đợi cho đến khi có token mới.
     */
    handleRefreshToken(): Observable<string | null> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.refreshToken().pipe(
                switchMap(response => {
                    this.isRefreshing = false;
                    return this.refreshTokenSubject.asObservable().pipe(
                        filter(token => token !== null),
                        take(1)
                    );
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    return throwError(() => err);
                })
            );
        }

        // Đang refresh → đợi token mới
        return this.refreshTokenSubject.asObservable().pipe(
            filter(token => token !== null),
            take(1)
        );
    }

    // ── Utilities ──────────────────────────────────────────────────────────────

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
