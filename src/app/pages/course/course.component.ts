import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, CourseResponseModel } from '../../core/services/course.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {

  private courseService = inject(CourseService);

  courses: CourseResponseModel[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.getAllCourses();
  }

  getAllCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.courses = response.result;
        } else {
          this.errorMessage = response.errors?.join(', ') || 'Failed to load courses.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while fetching courses.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
