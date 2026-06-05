import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    const registered = this.route.snapshot.queryParams['registered'];
    const message = this.route.snapshot.queryParams['message'];
    if (registered === 'true' && message) {
      this.successMessage = message;
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate([this.authService.getDashboardRoute()]);
      },
      error: (err) => {
        if (err.status === 0) {
          this.error = 'Could not reach the server. Make sure the backend is running on port 8080.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Username ose fjalekalimi eshte i gabuar';
        } else {
          this.error = `Error ${err.status}: ${err.error?.message ?? 'Login failed'}`;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
