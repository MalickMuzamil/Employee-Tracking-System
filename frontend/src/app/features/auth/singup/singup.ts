import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth-service';
import { Alert } from '../../../shared/services/alert';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-singup',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './singup.html',
  styleUrl: './singup.css',
})
export class Singup {
  name = '';
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

  signup(form: NgForm) {
    if (form.invalid) {
      this.alert.warning('Please fix the errors in the form.');
      return;
    }

    this.auth
      .signup({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.alert.success('Signup successful!', 'Welcome 🎉');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.alert.error(err.error.message || 'Signup failed');
        },
      });
  }
}
