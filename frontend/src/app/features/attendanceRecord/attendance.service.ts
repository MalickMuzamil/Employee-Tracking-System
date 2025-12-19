import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private api: ApiService) {}

  getTodayStatus(employee_id: number) {
    return this.api.get(`attendance/today/${employee_id}`);
  }

  checkIn(employee_id: number) {
    return this.api.post(`attendance/checkin`, { employee_id });
  }

  checkOut(employee_id: number) {
    return this.api.post(`attendance/checkout`, { employee_id });
  }
}
