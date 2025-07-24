import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class Registration {
  registrationForm: FormGroup;
  submitted = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    if (this.registrationForm.invalid) return;

    const { username, password } = this.registrationForm.value;
    this.authService.register({ username, password }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => (this.error = err),
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
