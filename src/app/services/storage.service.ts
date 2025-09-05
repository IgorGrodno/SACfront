import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly USER_KEY = 'auth-user';
  private readonly AUTH_TOKEN = 'auth-token';

  // 🔹 Флаг для переключения между sessionStorage и localStorage
  private persistent = false;

  clean(): void {
    this.removeUser();
    this.removeToken();
  }

  setPersistentMode(persistent: boolean): void {
    this.persistent = persistent;
  }

  saveUser(user: User): void {
    this.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    return this.getJson<User>(this.USER_KEY);
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

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ===== Универсальные методы =====
  private setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  private getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  private removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  private getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.removeItem(key);
      return null;
    }
  }

  private get storage(): Storage {
    return this.persistent ? localStorage : sessionStorage;
  }
}
