import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData = { username: '', password: '' };
  loading = false;
  loginError = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService

  ) { }

  login(form: NgForm) {
    this.loginError = '';

    if (form.invalid) {
      this.toastr.warning('Please fill in both fields correctly.', 'Missing Info', {
        timeOut: 3000,
        progressBar: true
      });
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.loading = true;

    this.api.login(this.loginData.username, this.loginData.password).subscribe({
      next: (res) => {
        this.loading = false;

        if (res?.token) {
          this.authService.setToken(res.token);
          this.toastr.success('Login successful!', 'Welcome', {
            timeOut: 2500,
            progressBar: true
          });
          this.router.navigate(['dashboard']);
        } else {
          this.loginError = 'Invalid credentials or missing token.';
          this.toastr.error('Invalid credentials, please try again.', 'Login Failed', {
            timeOut: 3000,
            progressBar: true
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err?.error?.message || 'Unable to connect. Please try again.';
        this.toastr.error(this.loginError, 'Login Failed', {
          timeOut: 3000,
          progressBar: true
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }


}
