import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LessonsResponseModel, LessonsService, SubLessonsResponseModel } from '../../../core/services/lessons.service';
import { DocumentsResponseModel, DocumentsService } from '../../../core/services/documents.service';
import { CourseResponseModel, CourseService, ResultResponse } from '../../../core/services/course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotifyError, NotifySuccess } from '../../../core/utils/notification.util';

@Component({
  selector: 'app-mana-lessons',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './mana-lessons.component.html',
  styleUrl: './mana-lessons.component.scss'
})
export class ManaLessonsComponent implements OnInit {

  course: CourseResponseModel | null = null;
  lessons: LessonsResponseModel[] = [];
  subLessons: SubLessonsResponseModel[] = [];
  documents: DocumentsResponseModel[] = [];
  selectedLesson: LessonsResponseModel | null = null;
  selectedDocument: DocumentsResponseModel | null = null;

  courseId: string | null = null;
  lessonId: string | null = null;

  private lessonsService = inject(LessonsService);
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentsService);
  private courseService = inject(CourseService);

  newLesson: any = {
    title: '',
    isLocked: false,
  }

  newSubLesson: any = {
    title: '',
    content: '',
    description: '',
    createDate: new Date(),
    isDelete: false,
    isLocked: false,
    videoLink: ''
  };

  subLessonFormModel: any = { ...this.newSubLesson };
  selectedSubLesson: SubLessonsResponseModel | null = null;
  isEditSubLesson: boolean = false;


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      this.lessonId = params.get('lessonId');

      if (this.courseId) {
        this.loadLessons(this.courseId);
        this.loadCourse(this.courseId);
      }
    });
  }

  onCreateLesson() {
    this.lessonsService.createLesson(this.newLesson, this.courseId || '').subscribe({
      next: (response: ResultResponse<LessonsResponseModel>) => {
        this.lessons.push(response.result);
        this.newLesson = {
          title: '',
          isLocked: false,
        }
        // Đóng modal sau khi tạo thành công
        document.getElementById('closeLessonModal')?.click();
        NotifySuccess('Tạo bài học thành công!');
      },
      error: (err: any) => {
        NotifyError(err.error.message || 'Không thể tạo bài học');

      }
    });
  }

  onUpdateLesson() {
    this.lessonsService.updateLesson(this.selectedLesson?.lessonId || '', this.selectedLesson!).subscribe({
      next: (response: ResultResponse<LessonsResponseModel>) => {
        this.selectedLesson = response.result;
        // Đóng modal sau khi cập nhật thành công
        document.getElementById('closeEditLessonModal')?.click();
        NotifySuccess('Cập nhật bài học thành công!');
      },
      error: (err: any) => {
        NotifyError(err.error.errors || 'Không thể cập nhật bài học');
      }
    });
  }

  onDeleteLesson(lessonId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này không?')) {
      this.lessonsService.deleteLesson(lessonId).subscribe({
        next: (res) => {
          this.lessons = this.lessons.filter(lesson => lesson.lessonId !== lessonId);
          this.lessonId = null;
          NotifySuccess('Xóa bài học thành công!');
        },
        error: (err: any) => {
          NotifyError(err.error.errors || 'Không thể xóa bài học');
        }
      });
    }
  }

  // --- SubLesson Handlers ---

  openAddSubLessonModal(type: string = 'video') {
    this.isEditSubLesson = false;
    this.subLessonFormModel = {
      title: '',
      content: '',
      description: '',
      createDate: new Date(),
      isDelete: false,
      isLocked: false,
      videoLink: '',
      type: type // track type: video, document, quiz
    };
  }

  openEditSubLessonModal(content: any, type: string = 'video') {
    this.isEditSubLesson = true;
    if (type === 'video') {
      this.selectedSubLesson = content;
      this.subLessonFormModel = { ...content, type: 'video' };
    } else {
      this.selectedDocument = content;
      this.subLessonFormModel = {
        title: content.title,
        description: content.description,
        videoLink: content.fileUrl,
        isLocked: content.isLocked,
        type: 'document'
      };
    }
  }

  onSubmitSubLesson() {
    if (this.subLessonFormModel.type === 'document') {
      this.submitDocument();
    } else {
      this.submitVideoLesson();
    }
  }

  private submitVideoLesson() {
    if (this.isEditSubLesson && this.selectedSubLesson) {
      this.lessonsService.updateSubLesson(this.selectedSubLesson.subLessonId, this.subLessonFormModel).subscribe({
        next: (res) => {
          NotifySuccess('Cập nhật bài học thành công!');
          this.loadSubLessons(this.selectedLesson?.lessonId || '');
          document.getElementById('closeSubLessonModal')?.click();
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi cập nhật bài học')
      });
    } else {
      this.lessonsService.createSubLesson(this.subLessonFormModel, this.selectedLesson?.lessonId || '').subscribe({
        next: (res) => {
          NotifySuccess('Thêm bài học thành công!');
          this.loadSubLessons(this.selectedLesson?.lessonId || '');
          document.getElementById('closeSubLessonModal')?.click();
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi thêm bài học')
      });
    }
  }

  private submitDocument() {
    const docData = {
      title: this.subLessonFormModel.title,
      description: this.subLessonFormModel.description,
      fileUrl: this.subLessonFormModel.videoLink,
      isLocked: this.subLessonFormModel.isLocked
    };

    if (this.isEditSubLesson && this.selectedDocument) {
      this.documentService.updateDocument(this.selectedDocument.documentId, docData).subscribe({
        next: (res) => {
          NotifySuccess('Cập nhật tài liệu thành công!');
          this.loadDocuments(this.selectedLesson?.lessonId || '');
          document.getElementById('closeSubLessonModal')?.click();
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi cập nhật tài liệu')
      });
    } else {
      this.documentService.createDocument(docData, this.selectedLesson?.lessonId || '').subscribe({
        next: (res) => {
          NotifySuccess('Thêm tài liệu thành công!');
          this.loadDocuments(this.selectedLesson?.lessonId || '');
          document.getElementById('closeSubLessonModal')?.click();
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi thêm tài liệu')
      });
    }
  }

  onDeleteSubLesson(subLessonId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      this.lessonsService.deleteSubLesson(subLessonId).subscribe({
        next: (res) => {
          NotifySuccess('Xóa bài học thành công!');
          this.loadSubLessons(this.selectedLesson?.lessonId || '');
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi xóa bài học')
      });
    }
  }

  onDeleteDocument(documentId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: (res) => {
          NotifySuccess('Xóa tài liệu thành công!');
          this.loadDocuments(this.selectedLesson?.lessonId || '');
        },
        error: (err) => NotifyError(err.error.message || 'Lỗi xóa tài liệu')
      });
    }
  }




  loadCourse(courseId: string): void {
    this.courseService.getCourseDetailsById(courseId).subscribe({
      next: (response: ResultResponse<CourseResponseModel>) => {
        this.course = response.result;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadLessons(courseId: string): void {
    this.lessonsService.getManaLessonsByCourseId(courseId).subscribe({
      next: (response: ResultResponse<LessonsResponseModel[]>) => {
        this.lessons = response.result;
        // Tự động chọn bài học đầu tiên khi load xong
        if (this.lessons.length > 0) {
          this.selectLesson(this.lessons[0]);
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  selectLesson(lesson: LessonsResponseModel): void {
    this.selectedLesson = lesson;
    this.subLessons = [];
    this.documents = [];
    this.loadSubLessons(lesson.lessonId);
    this.loadDocuments(lesson.lessonId);
  }

  loadSubLessons(lessonId: string): void {
    this.lessonsService.getManaSubLessonByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<SubLessonsResponseModel[]>) => {
        this.subLessons = response.result;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadDocuments(lessonId: string): void {
    this.documentService.getDocumentsByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<DocumentsResponseModel[]>) => {
        this.documents = response.result;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }




}
