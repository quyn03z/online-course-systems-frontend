import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { inject } from '@angular/core';

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

  private apiService = inject(ApiService)


  getAllCourses() {
    return this.apiService.get<ResultResponse<CourseResponseModel[]>>('course/get-alls-course');
  }
}