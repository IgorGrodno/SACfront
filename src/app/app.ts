import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { User } from './interfaces/user.interface';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'SACfront';

  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  storageService: StorageService = inject(StorageService);

  currentUser?: User;
  menuItems: Map<string, string> = new Map<string, string>();

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user || undefined;
      this.menuItems.clear();
      if (this.currentUser) {
        if (
          this.currentUser.roles?.includes('ROLE_ADMIN' as unknown as string)
        ) {
          this.menuItems.set('Users List', '/users-list');
          this.menuItems.set('Create Session', '/session-create');
          this.menuItems.set('Session List', '/session-list');
          this.menuItems.set('SkillCreate', '/skill-create');
          this.menuItems.set('DisciplineCreate', '/discipline-create');
          this.menuItems.set('DisciplineList', '/discipline-list');
          this.menuItems.set('Skill-list', '/skill-list');
          this.menuItems.set('TestResult', '/test-result');
        }
        if (
          this.currentUser.roles?.includes('ROLE_TEACHER' as unknown as string)
        ) {
          this.menuItems.set('DisciplineListExam', '');
        }
        if (
          this.currentUser.roles?.includes('ROLE_STUDENT' as unknown as string)
        ) {
        }
      }
      this.menuItems.set('Login', '/login');
      this.menuItems.set('Registration', '/registration');
    });
  }
}
