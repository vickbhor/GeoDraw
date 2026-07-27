import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  isRegisterMode = false;
  name = '';
  email = '';
  password = '';
  error = '';
  successMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = '';
    this.successMessage = '';
  }

  submit() {
    this.error = '';
    this.successMessage = '';

    if (this.isRegisterMode) {
      this.auth.register(this.name, this.email, this.password).subscribe({
        next: (res: any) => {
          this.successMessage = 'Registration successful! Please sign in.';
          this.isRegisterMode = false;
          this.password = ''; 
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Registration failed. Email might already exist.';
        }
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: (res: any) => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Invalid email or password.';
        }
      });
    }
  }
}