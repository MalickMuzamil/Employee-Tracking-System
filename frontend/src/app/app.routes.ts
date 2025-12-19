import { Routes } from '@angular/router';
import { EmployeeList } from './features/employees/employee-list/employee-list';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { Login } from './features/auth/login/login';
import { Singup } from './features/auth/singup/singup';
import { AuthGuard } from './core/guard/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Singup },

  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: EmployeeList },

      {
        path: 'employeeCheck',
        loadComponent: () =>
          import('./features/attendance/attendance/attendance').then(
            (m) => m.Attendance
          ),
      },

      {
        path: 'duty-toaster',
        loadComponent: () =>
          import('./features/duty-toaster/duty-toaster/duty-toaster').then(
            (m) => m.DutyToaster
          ),
      },
      {
        path: 'attendance-record',
        loadComponent: () =>
          import('./features/attendanceRecord/attendace-record/attendace-record').then(
            (m) => m.AttendaceRecord
          ),
      },
      {
        path: 'salary',
        loadComponent: () =>
          import('./features/salary/salary/salary').then(
            (m) => m.Salary
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
