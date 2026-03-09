import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Kiểm tra đăng nhập
    if (!authService.isLoggedIn()) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    // 2. Lấy danh sách roles cho phép từ data của route
    const expectedRoles = route.data['roles'] as Array<string>;
    const userRole = authService.getRole();

    // 3. Nếu không chỉ định roles -> cho qua (chỉ cần đăng nhập)
    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    // 4. Kiểm tra user có rolng danh sách cho phép không
    if (expectedRoles.includes(userRole)) {
        return true;
    }

    // 5. Không đủ quyền -> về trang access-denied
    router.navigate(['/access-denied']);
    return false;
};
