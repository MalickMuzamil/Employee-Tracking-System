import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SalaryService } from '../salary.service';
import { EmployeeService } from '../../employees/employee.service';
import { Alert } from '../../../shared/services/alert';
import { CommonModule } from '@angular/common';
import { Skeleton } from '../../../shared/skeleton/skeleton';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Skeleton],
  templateUrl: './salary.html',
  styleUrl: './salary.css',
})
export class Salary implements OnInit {
  employees: any[] = [];
  form!: FormGroup;

  lastSalary: any = null;
  salaryDifference: number | null = null;
  differenceType: 'increase' | 'decrease' | 'same' | null = null;

  constructor(
    private fb: FormBuilder,
    private salaryService: SalaryService,
    private employeeService: EmployeeService,
    private alert: Alert,
    private cdr: ChangeDetectorRef      
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      employee_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      effective_from: ['', Validators.required],
      note: [''],
    });

    this.loadEmployees();

    this.form.get('employee_id')?.valueChanges.subscribe((id) => {
      if (id) {
        this.loadLastSalary(id);
      } else {
        this.lastSalary = null;
        this.salaryDifference = null;
        this.differenceType = null;
        this.cdr.detectChanges();      // UI Update
      }
    });

    // When user types new amount → update difference
    this.form.get('amount')?.valueChanges.subscribe((newAmount) => {
      this.calculateDifference(Number(newAmount));
    });
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe((res: any) => {
      this.employees = res.data;
      this.cdr.detectChanges();   // Force UI update
    });
  }

  // Fetch last salary of employee
  loadLastSalary(employeeId: number) {
    this.salaryService.getHistory(employeeId).subscribe((res: any) => {
      this.lastSalary = res.data?.length ? res.data[0] : null;

      const currentAmount = this.form.get('amount')?.value;
      if (currentAmount) this.calculateDifference(Number(currentAmount));

      this.cdr.detectChanges();   // 🔥 FIX UI NOT UPDATING ISSUE
    });
  }

  // Calculate increment/decrement
  calculateDifference(newAmount: number) {
    if (!this.lastSalary || !newAmount) {
      this.salaryDifference = null;
      this.differenceType = null;
      this.cdr.detectChanges();
      return;
    }

    const oldAmount = Number(this.lastSalary.amount);
    const diff = newAmount - oldAmount;

    this.salaryDifference = Math.abs(diff);

    if (diff > 0) this.differenceType = 'increase';
    else if (diff < 0) this.differenceType = 'decrease';
    else this.differenceType = 'same';

    this.cdr.detectChanges();  // 👈 FORCE HTML UPDATE
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salaryService.addSalary(this.form.value).subscribe({
      next: () => {
        this.alert.success('Salary added successfully');
        this.form.reset();
        this.lastSalary = null;
        this.salaryDifference = null;
        this.differenceType = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.alert.error(err.error.message || 'Something went wrong');
      },
    });
  }
}
