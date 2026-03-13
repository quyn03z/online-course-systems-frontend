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
    return this.apiService.get<ResultResponse<DocumentsResponseModel[]>>(`ManaDocuments/alls-documents/${lessonId}`);
  }

  createDocument(document: any, lessonId: string): Observable<ResultResponse<DocumentsResponseModel>> {
    return this.apiService.post<ResultResponse<DocumentsResponseModel>>(`ManaDocuments/add-document/${lessonId}`, document);
  }

  updateDocument(documentId: string, document: any): Observable<ResultResponse<DocumentsResponseModel>> {
    return this.apiService.put<ResultResponse<DocumentsResponseModel>>(`ManaDocuments/update-document/${documentId}`, document);
  }

  deleteDocument(documentId: string): Observable<ResultResponse<boolean>> {
    return this.apiService.delete<ResultResponse<boolean>>(`ManaDocuments/remove-document/${documentId}`);
  }

}
