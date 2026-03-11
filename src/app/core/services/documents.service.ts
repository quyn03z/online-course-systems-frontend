import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';


export interface ResultResponse<T> {
  succeeded: boolean;
  result: T;
  errors: string[];
}

export interface DocumentsResponseModel {
  documentId: string;
  lessonId: string;
  title: string;
  description: string;
  fileUrl: string;
  isLocked: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  private apiService = inject(ApiService);

  getDocumentsByLessonId(lessonId: string): Observable<ResultResponse<DocumentsResponseModel[]>> {
    return this.apiService.get<ResultResponse<DocumentsResponseModel[]>>(`Documents/alls-documents/${lessonId}`);
  }


}
