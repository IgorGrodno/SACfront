import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly USER_KEY = 'auth-user';
  private readonly AUTH_TOKEN = 'auth_token';

  clean(): void {
    this.removeUser();
    this.removeToken();
  }

  saveUser(user: User): void {
    window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user) as User;
    }
    return null;
  }

  removeUser(): void {
    window.sessionStorage.removeItem(this.USER_KEY);
  }

  saveToken(token: string): void {
    window.sessionStorage.setItem(this.AUTH_TOKEN, token);
  }

  getToken(): string | null {
    return window.sessionStorage.getItem(this.AUTH_TOKEN);
  }

  removeToken(): void {
    window.sessionStorage.removeItem(this.AUTH_TOKEN);
  }

  getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles ?? [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
