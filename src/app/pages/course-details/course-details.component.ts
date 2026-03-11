import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, CourseResponseModel } from '../../core/services/course.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { LessonsService } from '../../core/services/lessons.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private lessonService = inject(LessonsService);

  course: CourseResponseModel | null = null;
  isLoading = false;
  errorMessage = '';
  isEnrolled = false;
  lessonId: string | null = null;

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (courseId) {
      this.loadCourseDetails(courseId);
      this.checkEnrollment(courseId);
      this.getFirstLessonIdByCourseId(courseId);
    } else {
      this.errorMessage = 'Không tìm thấy khóa học.';
    }
  }


  checkEnrollment(courseId: string) {
    this.paymentService.checkEnrollment(courseId).subscribe({
      next: (response) => {
        if (response.result == true) {
          this.isEnrolled = true;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  getFirstLessonIdByCourseId(courseId: string) {
    this.lessonService.getFirstLessonIdByCourseId(courseId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.lessonId = response.result.toString();
          console.log('First lesson ID:', this.lessonId);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCourseDetails(courseId: string): void {
    this.isLoading = true;
    this.courseService.getCourseDetailsById(courseId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.course = response.result;
        } else {
          this.errorMessage = response.errors?.join(', ') || 'Không thể tải khóa học.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Lỗi khi tải chi tiết khóa học.');
        this.errorMessage = 'Lỗi khi tải chi tiết khóa học.';
        this.isLoading = false;
      }
    });
  }


  createPaymentMomo() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const orderInfo = {
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      userId: Number(this.authService.getUserId()),
      courseId: this.course?.courseId,
      fullName: this.authService.getUserName(),
      orderInfo: 'Thanh toán khóa học: ' + this.course?.courseName,
      amount: this.course?.price
    };

    this.isLoading = true;
    this.paymentService.createPaymentMomo(orderInfo).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded) {
          if (response.result?.payUrl) {
            // Redirect sang trang thanh toán MoMo (Khóa có phí)
            window.location.href = response.result.payUrl;
          } else {
            // Khóa học miễn phí hoặc đã được xử lý đăng ký thành công
            if (this.lessonId) {
              this.router.navigate([`/course-details/${this.course?.courseId}/lessons/${this.lessonId}`]);
            } else {
              window.location.reload();
            }
          }
        } else {
          this.errorMessage = response.errors?.join(', ') || 'Không thể đăng ký khóa học.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi kết nối khi đăng ký khóa học.';
        console.error(err);
      }
    });
  }


}
