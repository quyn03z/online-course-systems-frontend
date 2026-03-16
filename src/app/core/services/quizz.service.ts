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


  getQuizzManaByLessonId(lessonId: string): Observable<ResultResponse<QuizzResponseModel>> {
    return this.apiService.get<ResultResponse<QuizzResponseModel>>(`ManaQuizz/get-mana-quizz/${lessonId}`);
  }

  addQuizz(quizz: any, lessonId: string): Observable<ResultResponse<any>> {
    return this.apiService.post<ResultResponse<any>>(`ManaQuizz/add-quizz/${lessonId}`, quizz);
  }

  updateQuizz(quizzId: string, quizz: any): Observable<ResultResponse<any>> {
    return this.apiService.put<ResultResponse<any>>(`ManaQuizz/update-quizz/${quizzId}`, quizz);
  }

  deleteQuizz(quizzId: string): Observable<ResultResponse<any>> {
    return this.apiService.delete<ResultResponse<any>>(`ManaQuizz/remove-quizz/${quizzId}`);
  }


}
