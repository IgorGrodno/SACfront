import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { UserRole } from '../interfaces/userRole.interface';

const USER_KEY = 'auth-user';
const AUTH_TOKEN = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(user: User): void {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user) as User;
    }
    return {} as User;
  }

  public removeUser(): void {
    window.sessionStorage.removeItem(USER_KEY);
  }

  public saveToken(token: string): void {
    window.sessionStorage.setItem(AUTH_TOKEN, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(AUTH_TOKEN);
  }

  public removeToken(): void {
    window.sessionStorage.removeItem(AUTH_TOKEN);
  }

  public getUserRoles(): UserRole[] {
    const user = this.getUser();
    return user?.roles ?? [];
  }

  public isLoggedIn(): boolean {
    return !!window.sessionStorage.getItem(USER_KEY);
  }
}
