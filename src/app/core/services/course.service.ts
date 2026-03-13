import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';

export interface ResultResponse<T> {
  succeeded: boolean;
  result: T;
  errors: string[];
  message?: string;
}

export interface CourseResponseModel {
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  image: string;
  price: number;
  creator: string;
  courseTypeName: string;
}

export interface CourseTypeResponseModel {
  courseTypeId: number;
  name: string;
}

export interface CourseManaResponseModel {
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  image?: string;
  avatar?: string;
  price: number;
  isLocked: boolean;
  isDelete: boolean;
  courseTypeId: number;
  courseTypeName: string;
}


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiService = inject(ApiService);

  getAllCourses(page: number = 1, pageSize: number = 9, search: string = '', courseTypeId: number | null = null, priceOrder: number | null = null) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (courseTypeId !== null && courseTypeId !== undefined) params = params.set('courseTypeId', courseTypeId.toString());
    if (priceOrder !== null && priceOrder !== undefined) params = params.set('priceOrder', priceOrder.toString());

    return this.apiService.get<ResultResponse<CourseResponseModel[]>>('course/get-alls-course', params);
  }

  getAllManaCourses(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.apiService.get<ResultResponse<CourseManaResponseModel[]>>('ManaCourse/get-alls-mana-course', params);
  }

  getCourseDetailsById(courseId: number | string) {
    return this.apiService.get<ResultResponse<CourseResponseModel>>(`Course/get-course-details/${courseId}`);
  }


  deleteCourse(courseId: number | string) {
    return this.apiService.delete<ResultResponse<any>>(`ManaCourse/remove-course/${courseId}`);
  }

  createCourse(course: any) {
    return this.apiService.post<ResultResponse<any>>('ManaCourse/add-course', course);
  }

  getAllsCourseType() {
    return this.apiService.get<ResultResponse<CourseTypeResponseModel[]>>('Course/alls-courseType');
  }

  updateCourse(courseId: number, course: any) {
    return this.apiService.put<ResultResponse<any>>(`ManaCourse/update-course/${courseId}`, course);
  }


}