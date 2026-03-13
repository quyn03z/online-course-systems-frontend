import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ResultResponse } from './course.service';


export interface QuestionsResponseModel {
  questionId: string;
  quizzId: string;
  questionText: string;
  typeId: string;
  answers: AnswerResponseModel[];
}

export interface AnswerResponseModel {
  answerId: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private apiService = inject(ApiService);

  getQuestionsByQuizzId(quizzId: string): Observable<ResultResponse<QuestionsResponseModel[]>> {
    return this.apiService.get<ResultResponse<QuestionsResponseModel[]>>(`Questions/get-alls-questions/${quizzId}`);
  }


}
