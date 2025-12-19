import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class DutyToasterService {
  constructor(private api: ApiService) {}

  // ------------------------------------
  // MONTHLY DUTY — BULK SAVE ONLY
  // ------------------------------------
  getAll() {
    return this.api.get('duty-toaster');
  }

  saveMonthlyBulk(data: any[]) {
    return this.api.post('duty-toaster/monthly/bulk', data);
  }

  // ------------------------------------
  // WEEKLY SCHEDULE (unchanged)
  // ------------------------------------
  getWeeklySchedule(empId: any, month: string, week: number) {
    return this.api.get(`duty-weekly-schedule/${empId}/${month}/${week}`);
  }

  saveFullWeek(data: any[]) {
    return this.api.post('duty-weekly-schedule/bulk', data);
  }

  // ------------------------------------
  // DAILY OVERRIDES (still available)
  // ------------------------------------
  saveOverride(data: any) {
    return this.api.post('duty-overrides', data);
  }

  getOverride(empId: any, date: string) {
    return this.api.get(`duty-overrides/${empId}/${date}`);
  }

  updateOverride(id: number, data: any) {
    return this.api.patch(`duty-overrides/${id}`, data);
  }

  getMonthlyDuty(empId: any, month: string) {
    return this.api.get(`duty-toaster/monthly/${empId}/${month}`);
  }
}
