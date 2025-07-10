import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  registrationForm: FormGroup;
  submitted = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.registrationForm.invalid) return;

    const { email, password } = this.registrationForm.value;

    // 🔐 Эмуляция логина
    if (email === 'admin@example.com' && password === 'password') {
      alert('Успешный вход!');
    } else {
      this.error = 'Неверный логин или пароль';
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
