import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, signal, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../../../core/services/admin.service';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

export interface AdminDashboardInfo {
  totalCourse: number;
  totalUser: number;
  totalCost: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {

  private adminService = inject(AdminService);
  public adminDashboardModel = signal<AdminDashboardInfo>({
    totalCourse: 0,
    totalUser: 0,
    totalCost: 0
  });

  public chartData = signal<any>(null);
  private areaChartInstance: Chart | null = null;
  private barChartInstance: Chart | null = null;

  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.getInforDashboard();
    this.getChartDashboard();
  }

  getInforDashboard() {
    this.adminService.getInforDashboard().subscribe((res: any) => {
      if (res.succeeded) {
        this.adminDashboardModel.set(res.result);
      }
    });
  }

  getChartDashboard() {
    this.adminService.getChartDashboard().subscribe((res: any) => {
      if (res.succeeded) {
        this.chartData.set(res.result);
        if (this.areaChartRef && this.barChartRef) {
          this.renderAreaChart(res.result.labels, res.result.data);
          this.renderBarChart(res.result.labels, res.result.data);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Không vẽ ngay lập tức nếu chưa có dữ liệu, hoặc vẽ với mảng rỗng
    if (this.chartData()) {
      this.renderAreaChart(this.chartData().labels, this.chartData().data);
      this.renderBarChart(this.chartData().labels, this.chartData().data);
    }
  }

  renderAreaChart(labels: string[], data: number[]) {
    if (this.areaChartInstance) {
      this.areaChartInstance.destroy();
    }

    this.areaChartInstance = new Chart(this.areaChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: data,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78,115,223,0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4e73df',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => v.toLocaleString() + ' ₫' } } }
      }
    });
  }

  renderBarChart(labels: string[], data: number[]) {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    this.barChartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: data,
          backgroundColor: '#4e73df',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => v.toLocaleString() + ' ₫' } } }
      }
    });
  }
}
