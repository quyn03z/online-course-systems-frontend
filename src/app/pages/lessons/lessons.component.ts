import { Component, inject, OnInit } from '@angular/core';
import { LessonsResponseModel, LessonsService, SubLessonsResponseModel } from '../../core/services/lessons.service';
import { ResultResponse } from '../../core/services/course.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {

  lessons: LessonsResponseModel[] = [];
  subLessons: SubLessonsResponseModel[] = [];
  currentSubLesson: SubLessonsResponseModel | null = null;

  private lessonsService = inject(LessonsService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  courseId: string | null = null;
  lessonId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      this.lessonId = params.get('lessonId');

      if (this.courseId) {
        this.loadLessons(this.courseId);
      }
      if (this.lessonId) {
        this.loadSubLessons(this.lessonId);
      }
    });
  }

  loadLessons(id: string): void {
    this.lessonsService.getLessonsByCourseId(id).subscribe({
      next: (response: ResultResponse<LessonsResponseModel[]>) => {
        this.lessons = response.result;
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }


  loadSubLessons(lessonId: string): void {
    this.lessonsService.getSubLessonByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<SubLessonsResponseModel[]>) => {
        this.subLessons = response.result;
        if (this.subLessons.length > 0) {
          this.currentSubLesson = this.subLessons[0];
        }
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }

  selectSubLesson(sub: SubLessonsResponseModel): void {
    this.currentSubLesson = sub;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    let videoId = '';

    // Xử lý link youtube (watch?v=ID hoặc youtube.be/ID)
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    } else {
      videoId = url; // Giả sử là ID nguyên bản
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
