import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ResultResponse } from './course.service';


export interface QuizzResponseModel {
  quizzId: string;
  title: string;
  lessonId: string;
  quizzTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizzService {

  private apiService = inject(ApiService);

  getQuizzByLessonId(lessonId: string): Observable<ResultResponse<QuizzResponseModel>> {
    return this.apiService.get<ResultResponse<QuizzResponseModel>>(`Quizz/get-alls-quizz/${lessonId}`);
  }

}
