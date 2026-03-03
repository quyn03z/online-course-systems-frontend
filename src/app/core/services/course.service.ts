import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';

export interface ResultResponse<T> {
  succeeded: boolean;
  result: T;
  errors: string[];
}

export interface CourseResponseModel {
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  image: string;
  price: number;
  courseTypeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiService = inject(ApiService);

  getAllCourses(page: number = 1, pageSize: number = 9) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.apiService.get<ResultResponse<CourseResponseModel[]>>('course/get-alls-course', params);
  }

  getCourseDetailsById(courseId: number | string) {
    return this.apiService.get<ResultResponse<CourseResponseModel>>(`Course/get-course-details/${courseId}`);
  }

}