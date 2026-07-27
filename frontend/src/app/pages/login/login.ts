import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  isRegisterMode = false;
  name = '';

  submit() {
    this.error = '';
    if (this.isRegisterMode) {
      this.auth.register(this.name, this.email, this.password).subscribe({
        next: () => { this.isRegisterMode = false; },
        error: (err) => this.error = err.error?.message || 'Registration failed'
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.error = err.error?.message || 'Login failed'
      });
    }
  }
}