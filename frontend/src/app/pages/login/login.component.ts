import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-login', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './login.component.html' })
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute, private toast: ToastService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: () => {
        this.loading = false; this.toast.success('Welcome back!');
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigate([redirect || '/dashboard']);
      },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Login failed. Please try again.'; },
    });
  }
}
