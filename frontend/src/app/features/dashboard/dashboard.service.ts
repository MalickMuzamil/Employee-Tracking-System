import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats() {
    return this.api.get('dashboard/stats');
  }

  generateReport() {
    return this.api.get('dashboard/report', { responseType: 'blob' });
  }
}
