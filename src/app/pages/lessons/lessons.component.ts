import { Component, inject, OnInit } from '@angular/core';
import { LessonsResponseModel, LessonsService, SubLessonsResponseModel } from '../../core/services/lessons.service';
import { ResultResponse } from '../../core/services/course.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentsResponseModel, DocumentsService } from '../../core/services/documents.service';

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
  documents: DocumentsResponseModel[] = [];
  currentDocument: DocumentsResponseModel | null = null;

  // Caching for Safe URLs to prevent iframe flickering/reloading
  private safeUrlCache = new Map<string, SafeResourceUrl>();


  private lessonsService = inject(LessonsService);
  private documentsService = inject(DocumentsService);
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
        this.loadDocuments(this.lessonId);
      }
    });
  }

  loadLessons(id: string): void {
    // If lessons are already loaded for this course, don't re-fetch
    if (this.lessons.length > 0 && this.courseId === id) {
      return;
    }

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

  loadDocuments(lessonId: string): void {
    this.documentsService.getDocumentsByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<DocumentsResponseModel[]>) => {
        this.documents = response.result;
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }

  loadSubLessons(lessonId: string): void {
    this.lessonsService.getManaSubLessonByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<SubLessonsResponseModel[]>) => {
        this.subLessons = response.result;
        // Only auto-select the first lesson if nothing is currently selected (first load)
        if (this.subLessons.length > 0 && !this.currentSubLesson && !this.currentDocument) {
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
    this.currentDocument = null;
  }

  selectDocument(doc: DocumentsResponseModel): void {
    this.currentDocument = doc;
    this.currentSubLesson = null;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    if (this.safeUrlCache.has(url)) {
      return this.safeUrlCache.get(url)!;
    }

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
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.safeUrlCache.set(url, safeUrl);
    return safeUrl;
  }

  getSafeDocumentUrl(fileUrl: string | undefined): SafeResourceUrl {
    if (!fileUrl) return '';
    if (this.safeUrlCache.has(fileUrl)) {
      return this.safeUrlCache.get(fileUrl)!;
    }

    let embedUrl = fileUrl;

    // Chuyển Google Drive share link sang dạng embed
    // https://drive.google.com/file/d/FILE_ID/view => https://drive.google.com/file/d/FILE_ID/preview
    if (fileUrl.includes('drive.google.com/file/d/')) {
      embedUrl = fileUrl.replace('/view', '/preview').replace('/edit', '/preview');
      if (!embedUrl.includes('/preview')) {
        const fileId = fileUrl.split('/d/')[1]?.split('/')[0];
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.safeUrlCache.set(fileUrl, safeUrl);
    return safeUrl;
  }
}
