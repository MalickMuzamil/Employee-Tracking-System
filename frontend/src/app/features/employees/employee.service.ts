import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private api: ApiService) {}

  getAllFromDump() {
    return this.api.get('db-test'); 
  }

  getAll() {
    return this.api.get('employees');
  }

  create(data: any) {
    return this.api.post('employees', data);
  }

  update(id: number, data: any) {
    return this.api.patch(`employees/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete(`employees/${id}`);
  }
}
