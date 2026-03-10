import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { NotifySuccess, NotifyError } from '../../../core/utils/notification.util';

@Component({
  selector: 'app-mana-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mana-courses.component.html',
  styleUrl: './mana-courses.component.scss'
})
export class ManaCoursesComponent implements OnInit {
  courses: any[] = [];
  private courseService = inject(CourseService);

  isLoading = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 1;

  // Modal edit
  showModal = false;
  selectedCourse: any = {};

  // Modal add
  showModalAdd = false;
  newCourse: any = {
    courseName: '',
    title: '',
    description: '',
    image: '',
    price: 0,
    courseTypeId: 1,
    isLocked: false,
    isDelete: false
  };

  ngOnInit(): void {
    this.getAllCourses();
  }

  getAllCourses() {
    this.isLoading = true;
    this.courseService.getAllCourses(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.courses = res.result; // According to CourseService res.result is CourseResponseModel[]
        // Note: CourseService doesn't return totalItems/totalPages in current implementation
        // I'll set dummy values for now if not present
        this.totalItems = this.courses.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.getAllCourses();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.getAllCourses();
  }

  openModalAdd() {
    this.newCourse = {
      courseName: '',
      title: '',
      description: '',
      image: '',
      price: 0,
      courseTypeId: 1,
      isLocked: false,
      isDelete: false
    };
    this.showModalAdd = true;
  }

  closeModalAdd() {
    this.showModalAdd = false;
  }

  onCreateCourse() {
    // TODO: Implement CourseService.createCourse
    NotifySuccess('Thêm khóa học thành công! (Simulated)');
    this.closeModalAdd();
    this.getAllCourses();
  }

  onEditCourse(course: any) {
    this.selectedCourse = { ...course };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSaveCourse() {
    // TODO: Implement CourseService.updateCourse
    NotifySuccess('Cập nhật khóa học thành công! (Simulated)');
    this.closeModal();
    this.getAllCourses();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllCourses();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllCourses();
    }
  }

  get showingFrom() { return (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo() { return Math.min(this.currentPage * this.pageSize, this.totalItems); }
}
