import { Component, ChangeDetectorRef } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../employees/employee.service';
import { Pagination } from '../../../shared/pagination/pagination';
import { PdfPayrollService } from '../pdf-payroll.service';
import { Alert } from '../../../shared/services/alert';
import { Skeleton } from "../../../shared/skeleton/skeleton";

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, Pagination, Skeleton],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {
  attendanceList: any[] = [];
  filteredList: any[] = [];

  employees: any[] = [];
  departments: string[] = [];

  selectedDate = new Date().toISOString().substring(0, 10);
  selectedEmployee = '';
  departmentFilter = '';
  search = '';

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private attendanceApi: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfPayrollService,
    private alert: Alert
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  toLocal(dateStr: string): Date | null {
    return dateStr ? new Date(dateStr) : null;
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe((res: any) => {
      this.employees = res.data;

      this.departments = [
        ...new Set(this.employees.map((e) => e.department_name)),
      ];

      this.cdr.detectChanges(); // 🔥 FIX
      this.loadAttendance();
    });
  }

  loadAttendance() {
    this.attendanceApi
      .getAdminAttendance(this.selectedDate)
      .subscribe((res: any) => {
        const map = new Map();
        res.data.forEach((a: any) => map.set(a.employee_id, a));

        this.attendanceList = this.employees.map((emp) => {
          const att = map.get(emp.employee_id);

          const shiftStart = emp.shift_start ?? '09:00:00';
          const shiftEnd = emp.shift_end ?? '17:00:00';

          const day = new Date(this.selectedDate).getDay();
          const isWeekend = day === 0 || day === 6;

          if (isWeekend) {
            return {
              employee_id: emp.employee_id,
              name: emp.name,
              department: emp.department_name,
              date: this.selectedDate,
              check_in: null,
              check_out: null,
              shift_start: shiftStart,
              shift_end: shiftEnd,
              status: 'Weekend Off',
            };
          }

          if (att) {
            return {
              ...att,
              name: emp.name,
              department: emp.department_name,
              shift_start: shiftStart,
              shift_end: shiftEnd,
              date: this.selectedDate,
              status: 'Present',
            };
          }

          return {
            employee_id: emp.employee_id,
            name: emp.name,
            department: emp.department_name,
            check_in: null,
            check_out: null,
            shift_start: shiftStart,
            shift_end: shiftEnd,
            date: this.selectedDate,
            status: 'Absent',
          };
        });

        this.filteredList = [...this.attendanceList];
        this.currentPage = 1;

        this.applyFilter();
        this.cdr.detectChanges(); // 🔥 FIX PART 2
      });
  }

  applyFilter() {
    this.filteredList = this.attendanceList.filter(
      (row) =>
        (!this.departmentFilter || row.department === this.departmentFilter) &&
        (!this.selectedEmployee || row.employee_id == this.selectedEmployee) &&
        (!this.search ||
          row.name.toLowerCase().includes(this.search.toLowerCase()))
    );

    this.currentPage = 1;
    this.cdr.detectChanges(); // 🔥 FIX PART 3
  }

  // ------- Existing Working Functions -------
  getWorkedHours(row: any): string {
    if (!row.check_in || !row.check_out) return '0 hrs';

    const start = this.toLocal(row.check_in)!;
    const end = this.toLocal(row.check_out)!;

    let diff = (end.getTime() - start.getTime()) / 1000;

    const hrs = Math.floor(diff / 3600);
    diff %= 3600;
    const mins = Math.floor(diff / 60);

    return `${hrs} hrs ${mins} min`;
  }

  getWorkedHoursNumber(row: any): number {
    if (!row.check_in || !row.check_out) return 0;

    const start = this.toLocal(row.check_in)!;
    const end = this.toLocal(row.check_out)!;

    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  getLateMinutes(row: any): number {
    if (!row.check_in || row.status === 'Weekend Off') return 0;

    const checkIn = this.toLocal(row.check_in)!;
    const [h, m, s] = row.shift_start.split(':');

    const shiftStart = new Date(checkIn);
    shiftStart.setHours(+h, +m, +(s || 0));

    const diff = (checkIn.getTime() - shiftStart.getTime()) / 60000;
    return diff > 0 ? Math.floor(diff) : 0;
  }

  getEarlyMinutes(row: any): number {
    if (!row.check_out || row.status === 'Weekend Off') return 0;

    const checkout = this.toLocal(row.check_out)!;
    const [h, m, s] = row.shift_end.split(':');

    const shiftEnd = new Date(checkout);
    shiftEnd.setHours(+h, +m, +(s || 0));

    const diff = (shiftEnd.getTime() - checkout.getTime()) / 60000;
    return diff > 0 ? Math.floor(diff) : 0;
  }

  getOvertime(row: any): string {
    const worked = this.getWorkedHoursNumber(row);

    if (worked <= 0 || row.status !== 'Present') return '0 hrs';

    const shiftStart = new Date(`2000-01-01T${row.shift_start}`);
    const shiftEnd = new Date(`2000-01-01T${row.shift_end}`);

    const shiftHours =
      (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

    if (worked <= shiftHours) return '0 hrs';

    const overtime = worked - shiftHours;

    const hrs = Math.floor(overtime);
    const mins = Math.round((overtime - hrs) * 60);

    return `${hrs} hrs ${mins} min`;
  }

  generatePayroll(row: any) {
    const month = this.selectedDate.substring(0, 7);

    const payload = {
      employee_id: row.employee_id,
      month,
    };

    this.attendanceApi.generatePayroll(payload).subscribe({
      next: (res: any) => {
        const employee = res.data.employee;
        const payroll = res.data.payroll;

        // Generate PDF
        this.pdfService.generatePayrollPDF(payroll, employee);

        // SweetAlert Success
        this.alert.success(
          'Payroll PDF has been downloaded!',
          'Payroll Generated'
        );
      },
      error: () => {
        this.alert.error('Failed to generate payroll', 'Error');
      },
    });
  }

  get paginatedList() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredList.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredList.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges(); // 🔥 FIX PART 4
    }
  }
}
