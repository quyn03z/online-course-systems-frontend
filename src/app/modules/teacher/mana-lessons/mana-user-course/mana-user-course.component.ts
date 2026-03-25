import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LessonsService } from '../../../../core/services/lessons.service';
import { Title } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-mana-user-course',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mana-user-course.component.html',
  styleUrl: './mana-user-course.component.scss'
})
export class ManaUserCourseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonsService = inject(LessonsService);
  private titleService = inject(Title);

  courseId: string | null = null;
  users: any[] = [];
  loading = false;

  // Statistics Modal properties
  showModal = false;
  statsLoading = false;
  selectedUserStats: any = null;
  selectedUserName = '';
  chart: any = null;

  ngOnInit(): void {
    this.titleService.setTitle('Quản lý học viên khóa học');
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.lessonsService.getUserEnrollmentCourse(this.courseId!).subscribe({
      next: (res: any) => {
        if (res.succeeded) {
          this.users = res.result;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  onStatisticUser(user: any) {
    this.selectedUserName = user.username;
    this.showModal = true;
    this.statsLoading = true;
    this.selectedUserStats = null;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.lessonsService.getUserStatisticById(user.id).subscribe({
      next: (res: any) => {
        if (res.succeeded) {
          this.selectedUserStats = res.result;
          console.log('Statistics result:', res.result);
          setTimeout(() => {
            this.renderChart();
          }, 100);
        }
        this.statsLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading statistics', err);
        this.statsLoading = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  renderChart() {
    const ctx = document.getElementById('userChart') as HTMLCanvasElement;
    if (!ctx || !this.selectedUserStats || !this.selectedUserStats.chartStatistic) return;

    const labels = this.selectedUserStats.chartStatistic.map((s: any) => s.quizzName);
    const data = this.selectedUserStats.chartStatistic.map((s: any) => s.score);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Điểm số',
          data: data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return `Điểm: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 2
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}
