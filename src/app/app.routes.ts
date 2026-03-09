import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './modules/account/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ForgotPasswordComponent } from './modules/account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/account/reset-password/reset-password.component';
import { CourseComponent } from './pages/course/course.component';
import { CourseDetailsComponent } from './pages/course-details/course-details.component';
import { AdminComponent } from './modules/admin/admin.component';
import { AdminDashboardComponent } from './modules/admin/pages/admin-dashboard/admin-dashboard.component';
import { ManageUserComponent } from './modules/admin/pages/manage-user/manage-user.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { PaymentCallbackComponent } from './pages/payment-callback/payment-callback.component';
import { AccessDenied401Component } from './shared/layouts/access-denied-401/access-denied-401.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { AuditLogsComponent } from './modules/admin/pages/audit-logs/audit-logs.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    // Trang login - KHÔNG có header/footer
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        children: [
            { path: '', component: AdminDashboardComponent },
            { path: 'manage-users', component: ManageUserComponent },
            { path: 'audit-logs', component: AuditLogsComponent },
            // Thêm trang admin mới ở đây, ví dụ:
            // { path: 'manage-courses', component: ManageCourseComponent },
        ]
    },
    // Các trang CÓ header/footer (bọc trong MainLayout)
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'course', component: CourseComponent },
            { path: 'course-details/:courseId', component: CourseDetailsComponent },
            { path: 'course-details/:courseId/lessons/:lessonId', component: LessonsComponent },
            { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
            { path: 'Checkout/PaymentCallBack', component: PaymentCallbackComponent, canActivate: [authGuard] },
            { path: 'access-denied', component: AccessDenied401Component },
        ]
    }
];
