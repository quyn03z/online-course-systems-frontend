import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ResultResponse } from './course.service';


export interface LessonsResponseModel {
  lessonId: string;
  title: string;
  courseId: string;
  isLocked: boolean;
  courseName: string;

}

export interface SubLessonsResponseModel {
  subLessonId: string;
  title: string;
  content: string;
  description: string;
  lessonId: string;
  videoLink: string;
}




@Injectable({
  providedIn: 'root'
})

export class LessonsService {


  private apiService = inject(ApiService);

  getLessonsByCourseId(courseId: string) {
    return this.apiService.get<ResultResponse<LessonsResponseModel[]>>(`Lesson/get-alls-lesson/${courseId}`);
  }

  getSubLessonByLessonId(lessonId: string) {
    return this.apiService.get<ResultResponse<SubLessonsResponseModel[]>>(`SubLesson/alls-sublesson/${lessonId}`);
  }

  getFirstLessonIdByCourseId(courseId: string) {
    return this.apiService.get<ResultResponse<number>>(`Lesson/getfirst-lessonId/${courseId}`);
  }

  getFirstSubLessonIdByLessonId(lessonId: string) {
    return this.apiService.get<ResultResponse<number>>(`SubLesson/getfirst-sublessonId/${lessonId}`);
  }

}
