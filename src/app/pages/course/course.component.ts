import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, CourseResponseModel } from '../../core/services/course.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {

  private courseService = inject(CourseService);

  courses: CourseResponseModel[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  pageSize = 9;
  hasNextPage = false;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const requestedPage = this.currentPage;

    this.courseService.getAllCourses(requestedPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.succeeded) {
          const results = response.result ?? [];

          if (results.length === 0 && requestedPage > 1) {
            // Trang rỗng → quay lại trang trước, tắt nút Sau
            this.currentPage = requestedPage - 1;
            this.hasNextPage = false;
          } else {
            this.courses = results;
            this.hasNextPage = results.length === this.pageSize;
          }
        } else {
          this.errorMessage = response.errors?.join(', ') || 'Lỗi khi tải khóa học.';
          this.courses = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Lỗi khi tải khóa học.';
        this.courses = [];
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCourses();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadCourses();
    }
  }


}
