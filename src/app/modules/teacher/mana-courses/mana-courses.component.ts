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
  courseTypes: any[] = [];

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
    this.getAllsCourseType();
  }

  getAllCourses() {
    this.isLoading = true;
    this.courseService.getAllManaCourses(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.result && res.result.items) {
          this.courses = res.result.items;
          this.totalItems = res.result.totalItems || 0;
          this.totalPages = res.result.totalPages || 1;
        } else if (Array.isArray(res.result)) {
          this.courses = res.result;
          if (this.courses.length === this.pageSize) {
            this.totalItems = this.pageSize * this.currentPage + 1;
          } else {
            this.totalItems = (this.currentPage - 1) * this.pageSize + this.courses.length;
          }
          this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        NotifyError('Không thể tải danh sách khóa học');
      }
    });
  }

  getAllsCourseType() {
    this.courseService.getAllsCourseType().subscribe({
      next: (res: any) => {
        console.log('Course Types Response:', res);
        this.courseTypes = res.result;
      },
      error: (err: any) => {
        console.error('Error loading course types:', err);
        NotifyError(err.error.message || 'Không thể tải danh sách loại khóa học');
      }
    })
  }

  onEditCourse(courseId: string) {
    const found = this.courses.find(c => c.courseId === courseId);
    if (found) {
      this.selectedCourse = { ...found };
      // Sync image to avatar for modal display
      if (this.selectedCourse.image && !this.selectedCourse.avatar) {
        this.selectedCourse.avatar = this.selectedCourse.image;
      }

      if (!this.selectedCourse.courseTypeId && this.courseTypes.length > 0) {
        this.selectedCourse.courseTypeId = this.courseTypes[0].courseTypeId;
      }
      this.showModal = true;
    }
  }

  openModalAdd() {
    this.newCourse = {
      courseName: '',
      title: '',
      description: '',
      avatar: '',
      image: '',
      price: 0,
      courseTypeId: this.courseTypes.length > 0 ? this.courseTypes[0].courseTypeId : 1,
      isLocked: false,
      isDelete: false
    };
    this.showModalAdd = true;
  }

  closeModalAdd() {
    this.showModalAdd = false;
  }

  onCreateCourse() {
    // Sync avatar field (from template) to image field (for backend)
    this.newCourse.image = this.newCourse.avatar || '';

    this.courseService.createCourse(this.newCourse).subscribe({
      next: (res: any) => {
        NotifySuccess('Thêm khóa học thành công!');
        this.closeModalAdd();
        this.currentPage = 1;
        this.getAllCourses();
      },
      error: (err: any) => {
        NotifyError(this.getErrorMessage(err) || 'Thêm khóa học thất bại');
      }
    })
  }

  onDeleteCourse(courseId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: (res: any) => {
          NotifySuccess('Xóa khóa học thành công!');
          this.getAllCourses();
        },
        error: (err: any) => {
          NotifyError(this.getErrorMessage(err) || 'Xóa khóa học thất bại');
        }
      });
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.getAllCourses();
  }

  onPageSizeChange() {
    this.currentPage = 1;
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

  closeModal() {
    this.showModal = false;
  }

  onSaveCourse() {
    // Sync avatar field (from template) to image field (for backend)
    this.selectedCourse.image = this.selectedCourse.avatar || '';

    this.courseService.updateCourse(this.selectedCourse.courseId, this.selectedCourse).subscribe({
      next: (res: any) => {
        NotifySuccess('Cập nhật khóa học thành công!');
        this.closeModal();
        this.getAllCourses();
      },
      error: (err: any) => {
        NotifyError(this.getErrorMessage(err) || 'Cập nhật khóa học thất bại');
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err.error && err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
      return err.error.errors.join(', ');
    }
    return err.error?.message || '';
  }



  get showingFrom() {
    if (this.courses.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }
  get showingTo() {
    const to = this.currentPage * this.pageSize;
    if (this.courses.length < this.pageSize) {
      return (this.currentPage - 1) * this.pageSize + this.courses.length;
    }
    return to;
  }
}
