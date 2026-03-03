import { Component, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements AfterViewInit {

  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  sidebarToggled = false;

  employees = [
    { name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', age: 61, start: '2011/04/25', salary: '$320,800' },
    { name: 'Garrett Winters', position: 'Accountant', office: 'Tokyo', age: 63, start: '2011/07/25', salary: '$170,750' },
    { name: 'Ashton Cox', position: 'Junior Technical Author', office: 'San Francisco', age: 66, start: '2009/01/12', salary: '$86,000' },
    { name: 'Cedric Kelly', position: 'Senior Javascript Developer', office: 'Edinburgh', age: 22, start: '2012/03/29', salary: '$433,060' },
    { name: 'Airi Satou', position: 'Accountant', office: 'Tokyo', age: 33, start: '2008/11/28', salary: '$162,700' },
    { name: 'Brielle Williamson', position: 'Integration Specialist', office: 'New York', age: 61, start: '2012/12/02', salary: '$372,000' },
    { name: 'Herrod Chandler', position: 'Sales Assistant', office: 'San Francisco', age: 59, start: '2012/08/06', salary: '$137,500' },
    { name: 'Rhona Davidson', position: 'Integration Specialist', office: 'Tokyo', age: 55, start: '2010/10/14', salary: '$327,900' },
    { name: 'Colleen Hurst', position: 'Javascript Developer', office: 'San Francisco', age: 39, start: '2009/09/15', salary: '$205,500' },
    { name: 'Sonya Frost', position: 'Software Engineer', office: 'Edinburgh', age: 23, start: '2008/12/13', salary: '$103,600' },
  ];

  searchTerm = '';
  pageSize = 10;
  currentPage = 1;

  get filteredEmployees() {
    const term = this.searchTerm.toLowerCase();
    return this.employees.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      e.office.toLowerCase().includes(term)
    );
  }

  get pagedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  minVal(a: number, b: number): number { return Math.min(a, b); }

  toggleSidebar() {
    this.sidebarToggled = !this.sidebarToggled;
  }

  ngAfterViewInit(): void {
    // Area Chart
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
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString() } }
        }
      }
    });

    // Bar Chart
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
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString() } }
        }
      }
    });
  }
}
