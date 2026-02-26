import { inject, Injectable, signal } from '@angular/core';
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
    avatar?: string;
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
    private readonly USER_KEY = 'current_user';

    // Signal reactive — template tự re-render khi login/logout
    readonly isLoggedIn = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
    readonly currentUser = signal<{ username: string; avatar: string } | null>(
        JSON.parse(localStorage.getItem(this.USER_KEY) ?? 'null')
    );

    // Dùng để queue các request đang chờ khi đang refresh token
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor() { }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.apiService.post<LoginResponse>('Auth/login', credentials).pipe(
            tap(response => {
                const result = response?.result ?? (response as any)?.Result;
                if (result?.token) {
                    this.saveTokens(result.token, result.refreshToken ?? '', result);
                }
            })
        );
    }

    saveTokens(accessToken: string, refreshToken: string, result?: LoginResult): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        if (result) {
            const userInfo = { username: result.username, avatar: result.avatar ?? '' };
            localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
            this.currentUser.set(userInfo);
        }
        this.isLoggedIn.set(true);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

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
                    this.refreshTokenSubject.next(response.result.token);
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

}
