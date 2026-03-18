import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LessonsResponseModel, LessonsService, SubLessonsResponseModel } from '../../core/services/lessons.service';
import { ResultResponse } from '../../core/services/course.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentsResponseModel, DocumentsService } from '../../core/services/documents.service';
import { MenteeScoreRequestModel, QuizzResponseModel, QuizzService } from '../../core/services/quizz.service';
import { QuestionsResponseModel, QuestionsService } from '../../core/services/questions.service';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {

  lessons: LessonsResponseModel[] = [];
  subLessons: SubLessonsResponseModel[] = [];
  currentSubLesson: SubLessonsResponseModel | null = null;
  documents: DocumentsResponseModel[] = [];
  currentDocument: DocumentsResponseModel | null = null;
  quizzes: QuizzResponseModel | null = null;
  currentQuizz: QuizzResponseModel | null = null;
  questions: QuestionsResponseModel[] = [];

  // Quiz State
  isDoingQuizz: boolean = false;
  showResult: boolean = false;
  userAnswers: Map<string, string> = new Map(); // questionId -> answerId
  score: number = 0;
  correctCount: number = 0;

  // Timer State
  remainingTime: number = 0; // seconds
  private timerInterval: any;

  // Caching for Safe URLs to prevent iframe flickering/reloading
  private safeUrlCache = new Map<string, SafeResourceUrl>();


  private lessonsService = inject(LessonsService);
  private documentsService = inject(DocumentsService);
  private quizzService = inject(QuizzService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private questionsService = inject(QuestionsService);



  courseId: string | null = null;
  lessonId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      this.lessonId = params.get('lessonId');

      this.currentSubLesson = null;
      this.currentDocument = null;
      this.currentQuizz = null;
      this.quizzes = null;

      if (this.courseId) {
        this.loadLessons(this.courseId);
      }
      if (this.lessonId) {
        this.loadSubLessons(this.lessonId);
        this.loadDocuments(this.lessonId);
        this.loadQuizz(this.lessonId);
      }
    });
  }

  loadQuizz(lessonId: string): void {
    this.quizzService.getQuizzByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<QuizzResponseModel>) => {
        this.quizzes = response.result;
        console.log("Quizz: ", response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }


  addMenteeScore(): void {
    if (!this.currentQuizz) return;
    this.submitQuizz();
    const menteeScore: MenteeScoreRequestModel = {
      quizId: this.currentQuizz.quizzId,
      score: this.score
    };
    this.quizzService.addMenteeScore(menteeScore).subscribe({
      next: (response: ResultResponse<any>) => {
        console.log("Score added successfully", response);
      },
      error: (err: any) => {
        console.error("Error adding score", err);
      }
    });
  }


  loadLessons(id: string): void {
    // If lessons are already loaded for this course, don't re-fetch
    if (this.lessons.length > 0 && this.courseId === id) {
      return;
    }

    this.lessonsService.getLessonsByCourseId(id).subscribe({
      next: (response: ResultResponse<LessonsResponseModel[]>) => {
        this.lessons = response.result;
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadDocuments(lessonId: string): void {
    this.documentsService.getDocumentsByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<DocumentsResponseModel[]>) => {
        this.documents = response.result;
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }

  loadSubLessons(lessonId: string): void {
    this.lessonsService.getManaSubLessonByLessonId(lessonId).subscribe({
      next: (response: ResultResponse<SubLessonsResponseModel[]>) => {
        this.subLessons = response.result;
        // Only auto-select the first lesson if nothing is currently selected (first load)
        if (this.subLessons.length > 0 && !this.currentSubLesson && !this.currentDocument) {
          this.currentSubLesson = this.subLessons[0];
        }
        console.log(response.result)
      },
      error: (err: any) => {
        console.error(err);
      }
    })
  }

  selectSubLesson(sub: SubLessonsResponseModel): void {
    this.currentSubLesson = sub;
    this.currentDocument = null;
    this.currentQuizz = null;
  }

  selectDocument(doc: DocumentsResponseModel): void {
    this.currentDocument = doc;
    this.currentSubLesson = null;
    this.currentQuizz = null;
  }

  selectQuizz(quizz: QuizzResponseModel): void {
    this.currentQuizz = quizz;
    this.currentSubLesson = null;
    this.currentDocument = null;
    this.isDoingQuizz = false;
    this.showResult = false;
    this.userAnswers.clear();
    this.stopTimer();
  }

  startQuizz(): void {
    if (!this.currentQuizz) return;

    this.questionsService.getQuestionsByQuizzId(this.currentQuizz.quizzId).subscribe({
      next: (response: ResultResponse<QuestionsResponseModel[]>) => {
        this.questions = response.result;
        this.isDoingQuizz = true;
        this.showResult = false;
        this.userAnswers.clear();
        const quizz = this.currentQuizz!;
        // Start Timer
        this.remainingTime = quizz.quizzTime * 60;
        this.startTimer();
      },
      error: (err: any) => {
        console.error("Error loading questions:", err);
      }
    });
  }

  startTimer(): void {
    this.stopTimer(); // Ensure no existing timer
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.submitQuizz();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  selectAnswer(questionId: string, answerId: string): void {
    this.userAnswers.set(questionId, answerId);
  }

  submitQuizz(): void {
    if (this.questions.length === 0) return;

    let correct = 0;
    this.questions.forEach(q => {
      const selectedAnswerId = this.userAnswers.get(q.questionId);
      const correctAnswer = q.answers.find(a => a.isCorrect);
      if (selectedAnswerId === correctAnswer?.answerId) {
        correct++;
      }
    });

    this.correctCount = correct;
    this.score = Math.round((correct / this.questions.length) * 10); // Thang điểm 10
    this.showResult = true;
    this.isDoingQuizz = false;
    this.stopTimer();
  }

  resetQuizz(): void {
    this.isDoingQuizz = false;
    this.showResult = false;
    this.userAnswers.clear();
    this.stopTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    if (this.safeUrlCache.has(url)) {
      return this.safeUrlCache.get(url)!;
    }

    let videoId = '';
    // Xử lý link youtube (watch?v=ID hoặc youtube.be/ID)
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    } else {
      videoId = url; // Giả sử là ID nguyên bản
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.safeUrlCache.set(url, safeUrl);
    return safeUrl;
  }

  getSafeDocumentUrl(fileUrl: string | undefined): SafeResourceUrl {
    if (!fileUrl) return '';
    if (this.safeUrlCache.has(fileUrl)) {
      return this.safeUrlCache.get(fileUrl)!;
    }

    let embedUrl = fileUrl;


    if (fileUrl.includes('drive.google.com/file/d/')) {
      embedUrl = fileUrl.replace('/view', '/preview').replace('/edit', '/preview');
      if (!embedUrl.includes('/preview')) {
        const fileId = fileUrl.split('/d/')[1]?.split('/')[0];
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.safeUrlCache.set(fileUrl, safeUrl);
    return safeUrl;
  }
}
