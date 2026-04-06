import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginResult {
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    role: string;
    avatar?: string;
    permissions?: string[];
}

export interface SignUpResult {
    id: string;
}
export interface SignUpResponse {
    succeeded: boolean;
    result: SignUpResult;
    errors: string[];
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
    readonly currentUser = signal<{ username: string; avatar: string; role: string; permissions: string[] } | null>(
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

    signUp(credentials: SignUpRequest): Observable<SignUpResponse> {
        return this.apiService.post<SignUpResponse>('Auth/register', credentials).pipe(
            tap(response => {
                const result = response?.result ?? (response as any)?.Result;
                if (result?.id) {
                    console.log(result.id);
                }
            })
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.apiService.post<any>('Auth/forgot-password', { email });
    }

    resetPassword(password: string, confirmPassword: string, token: string): Observable<any> {
        return this.apiService.post<any>(`Auth/reset-password`, { password, confirmPassword, token });
    }

    /**
     * Decode JWT token và trả về payload dưới dạng object.
     * Không cần thư viện ngoài, dùng atob() built-in của browser.
     */
    decodeToken(token: string): { [key: string]: any } | null {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }

    saveTokens(accessToken: string, refreshToken: string, result?: LoginResult): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

        // Decode token để lấy username và avatar
        const decoded = this.decodeToken(accessToken);
        const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/thumbnails/024/983/914/small/simple-user-default-icon-free-png.png';

        const username = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
            ?? decoded?.['unique_name'];

        const avatar = decoded?.['Avatar']
            ?? DEFAULT_AVATAR;

        const role = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            ?? decoded?.['role'];

        let permissions: string[] = [];
        if (result?.permissions) {
            permissions = result.permissions;
        } else if (decoded) {
            const rawPermissions = decoded['permission'] || decoded['permissions'];
            if (Array.isArray(rawPermissions)) {
                permissions = rawPermissions;
            } else if (typeof rawPermissions === 'string') {
                permissions = rawPermissions.split(',');
            }
        }

        const userInfo = { username, avatar, role, permissions };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
        this.currentUser.set(userInfo);
        this.isLoggedIn.set(true);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    getUserId() {
        const token = this.getToken();
        let userId = 0;
        if (token) {
            try {
                const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
                const payload = JSON.parse(atob(padded));
                userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
                    || payload['sub']
                    || payload['userId']
                    || payload['id']
                    || 0;
            } catch (e) {
                console.error('Không thể parse JWT token', e);
            }
        }
        return userId;
    }

    getUserName() {
        const token = this.getToken(); // Dùng đúng key access_token
        let userName = '';
        if (token) {
            try {
                const payload = this.decodeToken(token);
                userName = payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                    || payload?.['unique_name']
                    || '';
            } catch (e) {
                console.error('Không thể parse JWT token', e);
            }
        }
        return userName;
    }

    getRole(): string {
        // Ưu tiên lấy từ signal (memory) cho nhanh, nếu reload thì lấy từ localStorage
        const user = this.currentUser();
        if (user?.role) return user.role;

        const token = this.getToken();
        if (token) {
            const decoded = this.decodeToken(token);
            return decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                || decoded?.['role']
                || '';
        }
        return '';
    }

    hasRole(expectedRole: string): boolean {
        return this.getRole() === expectedRole;
    }

    hasPermission(permission: string): boolean {
        const user = this.currentUser();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    }

    logout(): void {
        const token = this.getToken();
        this._clearLocalSession();
        if (token) {
            this.apiService.post<any>('Auth/logout', {}, {
                Authorization: `Bearer ${token}`
            }).pipe(
                catchError(() => of(null))
            ).subscribe();
        }
    }

    private _clearLocalSession(): void {
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
                // Handle both camelCase and PascalCase from the backend
                const result: any = response?.result ?? (response as any)?.Result;
                const newToken = result?.token ?? result?.Token;
                const newRefreshToken = result?.refreshToken ?? result?.RefreshToken;
                if (newToken) {
                    console.log(newToken);
                    this.saveTokens(newToken, newRefreshToken ?? '');
                    this.refreshTokenSubject.next(newToken);
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
