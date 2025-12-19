import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Alert } from '../../../shared/services/alert';
import { AttendanceService } from '../attendance.service';
import { EmployeeService } from '../../employees/employee.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Skeleton } from "../../../shared/skeleton/skeleton";

@Component({
  selector: 'app-attendace-record',
  standalone: true,
  imports: [FormsModule, CommonModule, Skeleton],
  templateUrl: './attendace-record.html',
  styleUrl: './attendace-record.css',
})
export class AttendaceRecord implements OnInit {
  
  employees: any[] = [];
  selectedEmployee: any = '';

  attendanceLoaded = false;

  dutyStart = '--:--';
  dutyEnd = '--:--';

  checkInTime: string | null = null;
  checkOutTime: string | null = null;

  checkInOriginal: Date | null = null;
  elapsedTime: string = '00:00:00';
  timerInterval: any;

  isOffDay: boolean = false;

  constructor(
    private alert: Alert,
    private empService: EmployeeService,
    private attendanceApi: AttendanceService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    this.loadAllEmployees();
  }

  loadAllEmployees() {
    this.empService.getAll().subscribe((res: any) => {
      this.employees = res.data || [];

      this.cdr.detectChanges(); 
    });
  }

  // --------------------------------------------
  // LOAD ATTENDANCE
  // --------------------------------------------
  loadEmployeeAttendance() {
    if (!this.selectedEmployee) return;

    this.attendanceLoaded = false;
    this.cdr.detectChanges(); // show skeleton immediately

    this.attendanceApi.getTodayStatus(this.selectedEmployee).subscribe((res: any) => {
      const s = res.data;

      // OFF DAY
      this.isOffDay = s.is_off === 1;

      this.dutyStart =
        !this.isOffDay && s.expected_start && s.expected_start !== '00:00:00'
          ? s.expected_start.substring(0, 5)
          : '--:--';

      this.dutyEnd =
        !this.isOffDay && s.expected_end && s.expected_end !== '00:00:00'
          ? s.expected_end.substring(0, 5)
          : '--:--';

      if (this.isOffDay) {
        this.checkInTime = null;
        this.checkOutTime = null;
        this.elapsedTime = '00:00:00';
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.attendanceLoaded = true;
        this.cdr.detectChanges(); 
        return;
      }

      // Normal day logic
      this.checkInOriginal = s.check_in ? new Date(s.check_in) : null;

      this.checkInTime = s.check_in
        ? this.formatDisplayTime(new Date(s.check_in))
        : null;

      this.checkOutTime = s.check_out
        ? this.formatDisplayTime(new Date(s.check_out))
        : null;

      this.attendanceLoaded = true;

      if (s.check_out) {
        this.elapsedTime = this.formatWorkedTime(s.total_hours);
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.cdr.detectChanges();
        return;
      }

      if (s.check_in) this.startTimer();
      else this.elapsedTime = '00:00:00';

      this.cdr.detectChanges();
    });
  }

  // --------------------------------------------
  // TIME FORMAT
  // --------------------------------------------
  formatDisplayTime(date: Date) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatWorkedTime(hours: any): string {
    if (!hours) return '00:00:00';

    let totalSeconds = Math.floor(hours * 3600);
    const hrs = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return (
      hrs.toString().padStart(2, '0') +
      ':' +
      mins.toString().padStart(2, '0') +
      ':' +
      secs.toString().padStart(2, '0')
    );
  }

  // --------------------------------------------
  // TIMER
  // --------------------------------------------
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (!this.checkInOriginal) {
      this.elapsedTime = '00:00:00';
      return;
    }

    const checkIn = this.checkInOriginal;

    this.timerInterval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - checkIn.getTime();

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      this.elapsedTime =
        `${hrs.toString().padStart(2, '0')}:` +
        `${mins.toString().padStart(2, '0')}:` +
        `${secs.toString().padStart(2, '0')}`;

      this.cdr.detectChanges(); 
    }, 1000);
  }

  // --------------------------------------------
  // CHECK-IN
  // --------------------------------------------
  markCheckIn() {
    if (this.isOffDay) {
      this.alert.error("Today is an OFF Day. Cannot Check-In.");
      return;
    }

    this.attendanceApi.checkIn(this.selectedEmployee).subscribe(() => {
      this.alert.success('Checked In Successfully');
      this.loadEmployeeAttendance();
      this.cdr.detectChanges(); // 🔥
    });
  }

  // --------------------------------------------
  // CHECK-OUT
  // --------------------------------------------
  markCheckOut() {
    if (this.isOffDay) {
      this.alert.error("Today is an OFF Day. Cannot Check-Out.");
      return;
    }

    this.attendanceApi.checkOut(this.selectedEmployee).subscribe(() => {
      this.alert.success('Checked Out Successfully');
      this.loadEmployeeAttendance();
      this.cdr.detectChanges(); 
    });
  }
}
