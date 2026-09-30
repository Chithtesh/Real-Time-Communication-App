import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export const matchPassword: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password');
  const confirm = group.get('confirmPassword');
  if (!pw || !confirm) return null;
  return pw.value === confirm.value ? null : { passwordMismatch: true };
};

@Component({ selector: 'app-register', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './register.component.html' })
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-zA-Z])(?=.*[0-9])')]],
      confirmPassword: ['', Validators.required],
    }, { validators: matchPassword });
  }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.auth.register(this.form.value.name, this.form.value.email, this.form.value.password).subscribe({
      next: () => { this.loading = false; this.toast.success('Account created!'); this.router.navigate(['/dashboard']); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Registration failed.'; },
    });
  }
}
