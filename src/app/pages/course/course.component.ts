import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, CourseResponseModel, CourseTypeResponseModel } from '../../core/services/course.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {

  private courseService = inject(CourseService);

  courses: CourseResponseModel[] = [];
  courseTypes: CourseTypeResponseModel[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter & Search State
  searchTerm: string = '';
  selectedTypeId: number | null = null;
  priceOrder: number | null = null;
  private searchSubject = new Subject<string>();

  currentPage = 1;
  pageSize = 9;
  hasNextPage = false;

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCourses();
    });

    this.loadCourseTypes();
    this.loadCourses();
  }

  loadCourseTypes(): void {
    this.courseService.getAllsCourseType().subscribe({
      next: (response) => {
        if (response.result) {
          this.courseTypes = response.result || [];
          console.log("Course Types", this.courseTypes);
        }
      },
      error: (err) => console.error('Error fetching course types:', err)
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const requestedPage = this.currentPage;

    this.courseService.getAllCourses(
      requestedPage,
      this.pageSize,
      this.searchTerm,
      this.selectedTypeId,
      this.priceOrder
    ).subscribe({
      next: (response) => {
        if (response.succeeded) {
          const results = response.result ?? [];

          if (results.length === 0 && requestedPage > 1) {
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

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCourses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedTypeId = null;
    this.priceOrder = null;
    this.currentPage = 1;
    this.loadCourses();
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
