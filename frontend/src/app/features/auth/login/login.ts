import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../auth-service';
import { Alert } from '../../../shared/services/alert';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private alert: Alert
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(form: NgForm) {
    if (form.invalid) {
      this.alert.warning('Please fix the errors in the form.');
      return;
    }

    this.auth
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res: any) => {

          //Save Token and User Info
          this.auth.saveToken(res.token);
          localStorage.setItem('user', JSON.stringify(res.data));
          
          this.alert.success('Login successful!', 'Welcome 🎉');
          this.router.navigateByUrl('/dashboard');
        },

        error: (err) => {
          this.alert.error(err.error.message || 'Login failed');
        },
      });
  }
}
