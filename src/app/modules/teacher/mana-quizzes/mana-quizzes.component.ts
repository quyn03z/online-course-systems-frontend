import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsResponseModel, QuestionsService } from '../../../core/services/questions.service';
import { ActivatedRoute } from '@angular/router';
import { NotifyError, NotifySuccess } from '../../../core/utils/notification.util';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-mana-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  templateUrl: './mana-quizzes.component.html',
  styleUrl: './mana-quizzes.component.scss'
})

export class ManaQuizzesComponent implements OnInit {
  quizz: any = null;
  questions: QuestionsResponseModel[] = [];
  private questionsService = inject(QuestionsService);
  quizzId: string | null = null;
  private parentRoute = inject(ActivatedRoute);

  // Form State
  isEdit: boolean = false;
  selectedQuestion: any = null;
  showModalAdd: boolean = false;


  questionFormModel: any = {
    questionText: '',
    typeId: 1, // 1: Một đáp án, 2: Nhiều đáp án, 3: Đúng/Sai
    answers: [
      { answerText: '', isCorrect: true },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false }
    ]
  };

  ngOnInit(): void {
    this.quizzId = this.parentRoute.snapshot.params['quizzId'];
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.questionsService.getQuestionsByQuizzId(this.quizzId || '').subscribe({
      next: (res) => {
        this.questions = res.result;
        console.log(this.questions);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }


  openModalAdd() {
    // clear dữ liệu cũ 
    this.isEdit = false;
    this.questionFormModel = {
      questionText: '',
      typeId: 1,
      answers: [
        { answerText: '', isCorrect: true },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ]
    };
    this.showModalAdd = true;
  }


  onEditQuestion(questionId: string) {
    const found = this.questions.find(q => q.questionId === questionId);
    if (found) {
      this.isEdit = true;
      this.selectedQuestion = found;
      this.questionFormModel = JSON.parse(JSON.stringify(found));
      this.showModalAdd = true;
    }
  }

  onSaveQuestion() {
    if (this.isEdit) {
      this.onUpdateQuestion();
    } else {
      this.onCreateQuestion();
    }
  }

  onCreateQuestion() {
    this.questionsService.addQuestions(this.quizzId || '', this.questionFormModel).subscribe({
      next: (res) => {
        this.questions.push(res.result);
        this.closeModalAdd();
        NotifySuccess('Thêm câu hỏi thành công!');
      },
      error: (err) => {
        NotifyError(err.error.message || 'Thêm câu hỏi thất bại');
      }
    });
  }

  onUpdateQuestion() {
    const questionId = this.questionFormModel.questionId;
    this.questionsService.updateQuestions(questionId, this.questionFormModel).subscribe({
      next: (res) => {
        const index = this.questions.findIndex(q => q.questionId === questionId);
        if (index !== -1) {
          this.questions[index] = { ...this.questionFormModel };
        }
        this.closeModalAdd();
        NotifySuccess('Cập nhật câu hỏi thành công!');
      },
      error: (err) => {
        NotifyError(err.error.message || 'Cập nhật thất bại');
      }
    });
  }



  onRemoveQuestion(questionId: string) {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      this.questionsService.deleteQuestions(questionId).subscribe({
        next: (res) => {
          this.questions = this.questions.filter(q => q.questionId !== questionId);
          NotifySuccess('Xóa câu hỏi thành công!');
        },
        error: (err) => {
          NotifyError(err.error.message || 'Xóa câu hỏi thất bại');
        }
      });
    }
  }


  closeModalAdd() {
    this.showModalAdd = false;
  }

  // Thay đổi loại câu hỏi -> tự động format lại mảng answers
  onQuestionTypeChange() {
    const typeId = Number(this.questionFormModel.typeId);
    if (typeId === 1 || typeId === 2) {
      this.questionFormModel.answers = [
        { answerText: '', isCorrect: typeId === 1 },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ];
    } else if (typeId === 3) {
      this.questionFormModel.answers = [
        { answerText: 'Đúng', isCorrect: true },
        { answerText: 'Sai', isCorrect: false }
      ];
    }
  }

  // Radio: chỉ 1 đáp án đúng
  onRadioChange(index: number) {
    this.questionFormModel.answers.forEach((ans: any, i: number) => {
      ans.isCorrect = (i === index);
    });
  }

  // Thêm dòng đáp án mới
  addAnswerOption() {
    this.questionFormModel.answers.push({ answerText: '', isCorrect: false });
  }

  // Xóa 1 dòng đáp án
  removeAnswerOption(index: number) {
    if (this.questionFormModel.answers.length > 2) {
      this.questionFormModel.answers.splice(index, 1);
    } else {
      alert('Một câu hỏi phải có ít nhất 2 đáp án!');
    }
  }

}
