import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements AfterViewInit {

  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    new Chart(this.areaChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mar 1', 'Mar 3', 'Mar 5', 'Mar 7', 'Mar 9', 'Mar 11', 'Mar 13'],
        datasets: [{
          label: 'Revenue',
          data: [10000, 30000, 20000, 31000, 25000, 32000, 38000],
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
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString() } } }
      }
    });

    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
          label: 'Revenue',
          data: [4215, 5312, 6251, 7841, 9821, 14790],
          backgroundColor: '#4e73df',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString() } } }
      }
    });
  }
}
