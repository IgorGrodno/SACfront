import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
          this.menuItems.set('Список пользователей', '/users-list');
          this.menuItems.set('Список сессий', '/session-list');
          this.menuItems.set('Создать дисциплину', '/discipline-create');
          this.menuItems.set('Список дисциплин', '/discipline-list');
          this.menuItems.set('Создать навык', '/skill-create');
          this.menuItems.set('Список навыков', '/skill-list');
          this.menuItems.set('Экзамен по дисциплине', '/exam');
        }
        if (
          this.currentUser.roles?.includes('ROLE_TEACHER' as unknown as string)
        ) {
          this.menuItems.set('Экзамен по дисциплине', '/exam');
        }
        if (
          this.currentUser.roles?.includes('ROLE_STUDENT' as unknown as string)
        ) {
        }
      }
    });
  }
}
