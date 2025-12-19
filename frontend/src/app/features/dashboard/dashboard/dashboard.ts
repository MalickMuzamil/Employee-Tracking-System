import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Skeleton } from '../../../shared/skeleton/skeleton';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Skeleton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats: any[] = [];
  recent: any[] = [];
  loading: boolean = true;

  constructor(private dash: DashboardService) {}

  ngOnInit() {
    this.dash.getStats().subscribe((res: any) => {
      const d = res.data;

      this.stats = [
        {
          title: 'Total Employees',
          value: d.totalEmployees,
          icon: 'fa-users',
          color: '#4e73df',
        },
        {
          title: 'Active Employees',
          value: d.activeEmployees,
          icon: 'fa-user-check',
          color: '#1cc88a',
        },
        {
          title: 'Departments',
          value: d.departments,
          icon: 'fa-building',
          color: '#36b9cc',
        },
        {
          title: 'Monthly Salary Expense',
          value: d.monthlySalary + ' PKR',
          icon: 'fa-coins',
          color: '#f6c23e',
        },
      ];

      this.recent = d.recentEmployees;

      this.loading = false;
    });
  }

  onGenerateReport() {
    this.dash.generateReport().subscribe((file: Blob) => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(file);
      a.href = url;
      a.download = 'employee-report.pdf';
      a.click();
    });
  }
}
