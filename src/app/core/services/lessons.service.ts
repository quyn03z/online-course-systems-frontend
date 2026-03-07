import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LessonsService {

  private apiService = inject(ApiService);

  getLessonsByCourseId(courseId: string) {
    return this.apiService.get<LessonResponseModel[]>(`Lesson/get-alls-lesson/${courseId}`);
  }
}
