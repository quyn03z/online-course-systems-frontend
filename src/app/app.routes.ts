import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './modules/account/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Trang login - KHÔNG có header/footer
    { path: 'login', component: LoginComponent },

    // Các trang CÓ header/footer (bọc trong MainLayout)
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            // Thêm các route khác ở đây, ví dụ:
            // { path: 'courses', component: CoursesComponent, canActivate: [authGuard] },
        ]
    }
];
