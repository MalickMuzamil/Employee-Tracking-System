import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  constructor(private api: ApiService) {}

  addSalary(data: any) {
    return this.api.post('salary', data);
  }

  getHistory(employeeId: number) {
    return this.api.get(`salary/history/${employeeId}`);
  }

  deleteSalary(salaryId: number) {
    return this.api.delete(`salary/${salaryId}`);
  }

}
