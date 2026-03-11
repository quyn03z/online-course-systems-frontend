import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LessonsResponseModel, LessonsService, SubLessonsResponseModel } from '../../../core/services/lessons.service';
import { DocumentsResponseModel, DocumentsService } from '../../../core/services/documents.service';
import { CourseResponseModel, CourseService, ResultResponse } from '../../../core/services/course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mana-lessons',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mana-lessons.component.html',
  styleUrl: './mana-lessons.component.scss'
})
export class ManaLessonsComponent implements OnInit {

  course: CourseResponseModel | null = null;
  lessons: LessonsResponseModel[] = [];
  subLessons: SubLessonsResponseModel[] = [];
  documents: DocumentsResponseModel[] = [];
  selectedLesson: LessonsResponseModel | null = null;

  courseId: string | null = null;
  lessonId: string | null = null;

  private lessonsService = inject(LessonsService);
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentsService);
  private courseService = inject(CourseService);


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
    this.lessonsService.getLessonsByCourseId(courseId).subscribe({
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
    this.lessonsService.getSubLessonByLessonId(lessonId).subscribe({
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
