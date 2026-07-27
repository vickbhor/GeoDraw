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

  isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  submit() {
    this.error = '';
    this.successMessage = '';

    if (this.isRegisterMode) {
      if (!this.isValidPassword(this.password)) {
        this.error = 'Password must be at least 8 chars long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
        return; 
      }

      this.auth.register(this.name, this.email, this.password).subscribe({
        next: (res: any) => {
          if (res && (res.error || (res.message && res.message.toLowerCase().includes('already')))) {
             this.error = res.error || res.message;
             return;
          }
          this.successMessage = 'Registration successful! Please sign in.';
          this.isRegisterMode = false;
          this.password = ''; 
        },
        error: (err: any) => {
          this.error = err.error?.message || err.error?.error || (typeof err.error === 'string' ? err.error : 'Registration failed. Email might already exist.');
        }
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: (res: any) => {
          if (res && (res.error || (res.message && res.message.toLowerCase().includes('fail')))) {
             this.error = res.error || res.message;
             return;
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.error = err.error?.message || err.error?.error || (typeof err.error === 'string' ? err.error : 'Invalid email or password.');
        }
      });
    }
  }
}