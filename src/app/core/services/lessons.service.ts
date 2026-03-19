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
  isLocked: boolean;
}




@Injectable({
  providedIn: 'root'
})

export class LessonsService {


  private apiService = inject(ApiService);

  getLessonsByCourseId(courseId: string) {
    return this.apiService.get<ResultResponse<LessonsResponseModel[]>>(`Lesson/get-alls-lesson/${courseId}`);
  }

  getManaLessonsByCourseId(courseId: string) {
    return this.apiService.get<ResultResponse<LessonsResponseModel[]>>(`ManaLesson/get-alls-lesson/${courseId}`);
  }
  getSubLessonByLessonId(lessonId: string) {
    return this.apiService.get<ResultResponse<SubLessonsResponseModel[]>>(`SubLesson/alls-sublesson/${lessonId}`);
  }

  getManaSubLessonByLessonId(lessonId: string) {
    return this.apiService.get<ResultResponse<SubLessonsResponseModel[]>>(`ManaSubLesson/get-alls-sublesson/${lessonId}`);
  }



  getFirstLessonIdByCourseId(courseId: string) {
    return this.apiService.get<ResultResponse<number>>(`Lesson/getfirst-lessonId/${courseId}`);
  }

  getFirstSubLessonIdByLessonId(lessonId: string) {
    return this.apiService.get<ResultResponse<number>>(`SubLesson/getfirst-sublessonId/${lessonId}`);
  }

  createLesson(lesson: LessonsResponseModel, courseId: string) {
    return this.apiService.post<ResultResponse<LessonsResponseModel>>(`ManaLesson/add-lesson/${courseId}`, lesson);
  }


  updateLesson(lessonId: string, lesson: LessonsResponseModel) {
    return this.apiService.put<ResultResponse<LessonsResponseModel>>(`ManaLesson/update-lesson/${lessonId}`, lesson);
  }

  deleteLesson(lessonId: string) {
    return this.apiService.delete<ResultResponse<LessonsResponseModel>>(`ManaLesson/remove-lesson/${lessonId}`);
  }

  // --- SubLesson Management ---

  createSubLesson(subLesson: any, lessonId: string) {
    return this.apiService.post<ResultResponse<SubLessonsResponseModel>>(`ManaSubLesson/add-sublesson?lessonId=${lessonId}`, subLesson);
  }

  updateSubLesson(subLessonId: string, subLesson: any) {
    return this.apiService.put<ResultResponse<string>>(`ManaSubLesson/update-sublesson/${subLessonId}`, subLesson);
  }

  deleteSubLesson(subLessonId: string) {
    return this.apiService.delete<ResultResponse<string>>(`ManaSubLesson/remove-sublesson/${subLessonId}`);
  }




}
