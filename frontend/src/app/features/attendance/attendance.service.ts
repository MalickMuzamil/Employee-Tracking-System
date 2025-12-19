// attendance.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  constructor(private api: ApiService) {}

  getAdminAttendance(date: string) {
    return this.api.get(`attendance/admin?date=${date}`);
  }

  // ⭐ NEW — Payroll Generate
  generatePayroll(payload: any) {
    return this.api.post(`payroll/generate`, payload);
  }

}
