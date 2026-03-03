import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService, CourseResponseModel } from '../../core/services/course.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  course: CourseResponseModel | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (courseId) {
      this.loadCourseDetails(courseId);
    } else {
      this.errorMessage = 'Không tìm thấy khóa học.';
    }
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
}
