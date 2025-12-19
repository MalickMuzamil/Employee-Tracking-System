import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DutyToasterService } from '../duty-toaster.service';
import { EmployeeService } from '../../employees/employee.service';
import { Alert } from '../../../shared/services/alert';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Skeleton } from "../../../shared/skeleton/skeleton";

@Component({
  selector: 'app-duty-toaster',
  standalone: true,
  imports: [CommonModule, FormsModule, Skeleton],
  templateUrl: './duty-toaster.html',
  styleUrl: './duty-toaster.css',
})
export class DutyToaster implements OnInit {

  // -----------------------------------
  // EMPLOYEES
  // -----------------------------------
  employees: any[] = [];
  departments: string[] = [];
  filteredList: any[] = [];
  departmentFilter = '';
  selectedEmployee: string = '';
  selectedEmployeeInfo: any = null;

  // -----------------------------------
  // MONTHLY DUTY
  // -----------------------------------
  selectedMonth = '';
  dutyStart = '';
  dutyEnd = '';
  monthDays: any[] = [];
  weeklyOffDays: string[] = [];

  weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  dutyList: any[] = [];
  filteredDutyList: any[] = [];

  constructor(
    private dutyApi: DutyToasterService,
    private employeeService: EmployeeService,
    private alert: Alert,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDuties();
  }

  // ----------------------------
  // EMPLOYEES
  // ----------------------------
  loadEmployees() {
    this.employeeService.getAll().subscribe((res: any) => {
      this.employees = res.data || [];

      this.departments = [
        ...new Set(this.employees.map((e) => e.department_name)),
      ];

      this.filteredList = [...this.employees];

      this.cdr.detectChanges(); // 🔥 UI instantly update
    });
  }

  applyFilter() {
    this.filteredList = this.employees.filter(
      (emp) =>
        !this.departmentFilter ||
        emp.department_name === this.departmentFilter
    );

    this.filterDutyTable();
    this.cdr.detectChanges();
  }

  selectEmployee() {
    this.selectedEmployeeInfo = this.employees.find(
      (e) => e.employee_id == this.selectedEmployee
    );

    this.filterDutyTable();
    this.cdr.detectChanges();  // 🔥 employee card update instantly
  }

  // ----------------------------
  // MONTHLY DUTY LOGIC
  // ----------------------------
  onMonthSelect() {
    if (!this.selectedEmployee || !this.selectedMonth) return;

    this.dutyApi
      .getMonthlyDuty(this.selectedEmployee, this.selectedMonth)
      .subscribe((res: any) => {
        const saved = res.data || [];

        if (saved.length > 0) {
          this.monthDays = saved.map((d: any) => ({
            date: d.date,
            dayName: new Date(d.date).toLocaleDateString('en-US', {
              weekday: 'long',
            }),
            is_off: d.is_off == 1,
            start:
              d.duty_start && d.duty_start !== '00:00:00'
                ? d.duty_start
                : '',
            end: d.duty_end && d.duty_end !== '00:00:00'
                ? d.duty_end
                : '',
          }));
        } else {
          this.generateMonthDays();
        }

        this.cdr.detectChanges(); // 🔥 calendar UI update instantly
      });
  }

  generateMonthDays() {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const total = new Date(year, month, 0).getDate();

    this.monthDays = [];

    for (let i = 1; i <= total; i++) {
      const dateObj = new Date(year, month - 1, i);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      this.monthDays.push({
        date: `${year}-${month}-${i.toString().padStart(2, '0')}`,
        dayName,
        is_off: this.weeklyOffDays.includes(dayName),
        start: this.dutyStart || '',
        end: this.dutyEnd || '',
      });
    }

    this.cdr.detectChanges();
  }

  toggleOffDay(event: any) {
    const day = event.target.value;

    if (event.target.checked) {
      this.weeklyOffDays.push(day);
    } else {
      this.weeklyOffDays = this.weeklyOffDays.filter((d) => d !== day);
    }

    this.updateOffDaysOnTable();
    this.cdr.detectChanges();
  }

  updateOffDaysOnTable() {
    this.monthDays = this.monthDays.map((d) => ({
      ...d,
      is_off: this.weeklyOffDays.includes(d.dayName),
    }));

    this.cdr.detectChanges();
  }

  applyCommonShift() {
    if (!this.dutyStart || !this.dutyEnd)
      return this.alert.error('Enter default timings');

    this.monthDays = this.monthDays.map((d) => ({
      ...d,
      is_off: this.weeklyOffDays.includes(d.dayName),
      start: d.is_off ? '' : this.dutyStart,
      end: d.is_off ? '' : this.dutyEnd,
    }));

    this.alert.success('Applied to entire month!');
    this.cdr.detectChanges();
  }

  saveMonthlyDuty() {
    if (!this.selectedEmployee)
      return this.alert.error('Select employee');

    if (!this.selectedMonth)
      return this.alert.error('Select month');

    const payload = this.monthDays.map((d) => ({
      employee_id: this.selectedEmployee,
      date: d.date.split('T')[0],
      is_off: d.is_off,
      duty_start: d.is_off ? null : d.start,
      duty_end: d.is_off ? null : d.end,
    }));

    this.dutyApi.saveMonthlyBulk(payload).subscribe(() => {
      this.alert.success('Monthly duty saved successfully!');
      this.cdr.detectChanges();
    });
  }

  // -----------------------------------
  // LOADED MONTHLY DUTIES
  // -----------------------------------
  loadDuties() {
    this.dutyApi.getAll().subscribe((res: any) => {
      this.dutyList = res.data || [];
      this.filterDutyTable();

      this.cdr.detectChanges(); // 🔥 UI refresh fix
    });
  }

  filterDutyTable() {
    this.filteredDutyList = this.dutyList.filter(
      (d) =>
        (!this.departmentFilter ||
          d.department_name === this.departmentFilter) &&
        (!this.selectedEmployee || d.employee_id == this.selectedEmployee)
    );

    this.cdr.detectChanges();
  }
}
