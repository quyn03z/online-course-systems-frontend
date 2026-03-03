import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './modules/account/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { ForgotPasswordComponent } from './modules/account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/account/reset-password/reset-password.component';
import { CourseComponent } from './pages/course/course.component';
import { CourseDetailsComponent } from './pages/course-details/course-details.component';
import { AdminComponent } from './modules/admin/admin.component';
import { ProfileComponent } from './modules/profile/profile.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    // Trang login - KHÔNG có header/footer
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'admin', component: AdminComponent },
    // Các trang CÓ header/footer (bọc trong MainLayout)
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'course', component: CourseComponent },
            { path: 'course-details/:courseId', component: CourseDetailsComponent },
            { path: 'profile', component: ProfileComponent },
            // Thêm các route khác ở đây, ví dụ:
            // { path: 'courses', component: CoursesComponent, canActivate: [authGuard] },
        ]
    }
];
