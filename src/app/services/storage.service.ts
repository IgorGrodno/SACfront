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
    this.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const json = this.getItem(this.USER_KEY);
    if (!json) return null;

    try {
      return JSON.parse(json) as User;
    } catch {
      this.removeUser();
      return null;
    }
  }

  removeUser(): void {
    this.removeItem(this.USER_KEY);
  }

  saveToken(token: string): void {
    this.setItem(this.AUTH_TOKEN, token);
  }

  getToken(): string | null {
    return this.getItem(this.AUTH_TOKEN);
  }

  removeToken(): void {
    this.removeItem(this.AUTH_TOKEN);
  }

  getUserRoles(): string[] {
    return this.getUser()?.roles ?? [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setItem(key: string, value: string): void {
    window.sessionStorage.setItem(key, value);
  }

  private getItem(key: string): string | null {
    return window.sessionStorage.getItem(key);
  }

  private removeItem(key: string): void {
    window.sessionStorage.removeItem(key);
  }
}
