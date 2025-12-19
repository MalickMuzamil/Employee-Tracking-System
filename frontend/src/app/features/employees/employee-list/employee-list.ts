import { Component, ChangeDetectorRef } from '@angular/core';
import { Table } from '../../../shared/table/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { environment } from '../../../../environments/environment';
import { Alert } from '../../../shared/services/alert';
import { Pagination } from '../../../shared/pagination/pagination';
import posthog from 'posthog-js';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, Table, FormsModule, Pagination],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList {
  loading = true;
  employees: any[] = [];
  filteredEmployees: any[] = [];
  pagedEmployees: any[] = [];
  departments: string[] = [];
  designations: string[] = [];
  grades: string[] = [];

  showAddModal = false;
  showEditModal = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;

  columns = [
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
    { field: 'contact', title: 'Contact' },
    { field: 'gender', title: 'Gender' },
    { field: 'department_name', title: 'Department' },
    { field: 'designation_name', title: 'Designation' },
    { field: 'grade_name', title: 'Grade' },
    { field: 'picture', title: 'Image' },
  ];

  selectedFilter: string = '';
  filterValue: string = '';
  hiddenColumn: string = '';

  form: any = {
    name: '',
    email: '',
    contact: '',
    address: '',
    department: '',
    designation: '',
    grade: '',
    gender: '',
    picture: null,
  };

  editingId: number | null = null;
  selectedFile: File | null = null;

  constructor(
    private employeeService: EmployeeService,
    private alert: Alert,
    private cdr: ChangeDetectorRef // 🔥 ADD CHANGE DETECTOR
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  // -----------------------------------------------------
  // LOAD EMPLOYEES
  // -----------------------------------------------------
  loadEmployees() {
    this.loading = true;
    this.cdr.detectChanges(); // show skeleton instantly

    this.employeeService.getAll().subscribe({
      next: (res) => {
        this.employees = res.data;
        this.filteredEmployees = [...this.employees];

        this.extractDropdownValues();
        this.currentPage = 1;
        this.paginate();

        this.loading = false;

        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAdd() {
    posthog.capture('employee_add_opened');

    this.form = {
      name: '',
      email: '',
      contact: '',
      address: '',
      department: '',
      designation: '',
      grade: '',
      gender: '',
      picture: null,
    };

    this.selectedFile = null;
    this.showAddModal = true;

    this.cdr.detectChanges();
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.cdr.detectChanges();
  }

  submitAdd(form?: any) {
    if (form && form.invalid) return;

    const fd = new FormData();
    Object.keys(this.form).forEach((key) => fd.append(key, this.form[key]));
    if (this.selectedFile) fd.append('picture', this.selectedFile);

    this.employeeService.create(fd).subscribe({
      next: (res) => {
        if (res?.status === 201) {
          posthog.capture('employee_created', {
            name: this.form.name,
            department: this.form.department,
          });

          this.showAddModal = false;
          this.loadEmployees();
          this.alert.success('Employee added successfully!');
        } else {
          this.alert.error('Failed to add employee!');
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.alert.error(
          'Create Error: ' + (err?.error?.message || err.message)
        );
        this.cdr.detectChanges();
      },
    });
  }

  openEdit(row: any) {
    this.editingId = row.employee_id;

    posthog.capture('employee_edit_opened', {
      id: row.employee_id,
      name: row.name,
    });

    const base = environment.imageBaseUrl;

    this.form = {
      name: row.name,
      email: row.email,
      contact: row.contact,
      address: row.address,
      department: row.department_name,
      designation: row.designation_name,
      grade: row.grade_name,
      gender: row.gender,
      picture: row.picture ? `${base}/${row.picture}` : null,
    };

    this.selectedFile = null;
    this.showEditModal = true;

    this.cdr.detectChanges(); // 🔥 UI update
  }

  submitEdit(form?: any) {
    if (form && form.invalid) return;
    if (!this.editingId) return;

    const fd = new FormData();
    Object.keys(this.form).forEach((key) => {
      if (key !== 'picture') fd.append(key, this.form[key]);
    });
    if (this.selectedFile) fd.append('picture', this.selectedFile);

    this.employeeService.update(this.editingId, fd).subscribe({
      next: (res) => {
        if (res?.status === 200) {
          posthog.capture('employee_updated', {
            id: this.editingId,
            name: this.form.name,
          });

          this.showEditModal = false;
          this.editingId = null;
          this.loadEmployees();
          this.alert.success('Employee updated successfully!');
        } else {
          this.alert.error('Update failed!');
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.alert.error(
          'Update Error: ' + (err?.error?.message || err.message)
        );
        this.cdr.detectChanges();
      },
    });
  }

  onDelete(row: any) {
    const id = row.id ?? row.employee_id ?? row.employeeId;
    if (!id) return alert('Invalid ID');

    this.alert
      .confirmDelete('Do you really want to delete this employee?')
      .then((result) => {
        if (!result.isConfirmed) return;

        this.employeeService.delete(id).subscribe({
          next: () => {
            posthog.capture('employee_deleted', { id });
            this.alert.success('Employee deleted successfully!');
            this.loadEmployees();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.alert.error(
              'Delete Error: ' + (err?.error?.message || err.message)
            );
            this.cdr.detectChanges();
          },
        });
      });
  }

  applyFilter() {
    if (!this.selectedFilter || !this.filterValue.trim()) {
      this.filteredEmployees = [...this.employees];
      this.hiddenColumn = '';
    } else {
      const term = this.filterValue.toLowerCase();
      this.filteredEmployees = this.employees.filter((emp) =>
        emp[this.selectedFilter]?.toString().toLowerCase().includes(term)
      );
      this.hiddenColumn = this.selectedFilter;

      posthog.capture('employee_filter_used', {
        filterBy: this.selectedFilter,
        value: this.filterValue,
      });
    }

    this.currentPage = 1;
    this.paginate();

    this.cdr.detectChanges();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedEmployees = this.filteredEmployees.slice(start, end);

    this.cdr.detectChanges();
  }

  onPageChange(page: number) {
    posthog.capture('employee_page_changed', { page });

    this.currentPage = page;
    this.paginate();

    this.cdr.detectChanges();
  }

  extractDropdownValues() {
    this.departments = [
      ...new Set(this.employees.map((e) => e.department_name).filter(Boolean)),
    ];

    this.designations = [
      ...new Set(this.employees.map((e) => e.designation_name).filter(Boolean)),
    ];

    this.grades = [
      ...new Set(this.employees.map((e) => e.grade_name).filter(Boolean)),
    ];

    this.cdr.detectChanges();
  }
}
