import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ResultResponse } from './course.service';


export interface QuestionsResponseModel {
  questionId: string;
  quizzId: string;
  questionText: string;
  typeId: number;
  answers: AnswerResponseModel[];
}

export interface QuestionRequestModel {
  questionId: string;
  questionText: string;
  typeId: number;
  answers: AnswerRequestModel[];
}

export interface AnswerRequestModel {
  questionId: string;
  answerText: string;
  isCorrect: boolean;
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


  updateQuestions(questionId: string, quizzQuestionsRequestModel: QuestionRequestModel): Observable<ResultResponse<string>> {
    return this.apiService.put<ResultResponse<string>>(`ManaQuestions/update-questions/${questionId}`, quizzQuestionsRequestModel);
  }


  deleteQuestions(questionId: string): Observable<ResultResponse<string>> {
    return this.apiService.delete<ResultResponse<string>>(`ManaQuestions/delete-questions/${questionId}`);
  }

  addQuestions(quizzId: string, questionRequestModel: QuestionRequestModel): Observable<ResultResponse<QuestionsResponseModel>> {
    return this.apiService.post<ResultResponse<QuestionsResponseModel>>(`ManaQuestions/add-questions/${quizzId}`, questionRequestModel);
  }

}
