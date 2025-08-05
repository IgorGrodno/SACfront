import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { RegisterResponse } from '../interfaces/registerResponse.interface';
import { User } from '../interfaces/user.interface';

interface LoginResponse {
  id: number;
  username: string;
  roles: string[];
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly loggedInSubject = new BehaviorSubject<boolean>(false);
  public readonly loggedIn$ = this.loggedInSubject.asObservable();

  private readonly router: Router = inject(Router);

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService
  ) {
    const storedUser = this.storageService.getUser();
    if (storedUser?.username) {
      this.setCurrentUser(storedUser);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.loggedInSubject.next(true);
    this.storageService.saveUser(user);
  }

  login(credentials: { username: string; password: string }): Observable<User> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/signin`,
        credentials,
        this.httpOptions
      )
      .pipe(
        tap((res) => {
          this.storageService.saveToken(res.token);
          const user: User = {
            id: res.id,
            username: res.username,
            roles: res.roles,
          };
          this.setCurrentUser(user);
        }),
        map((res) => ({
          id: res.id,
          username: res.username,
          roles: res.roles,
        }))
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/signout`, {}, this.httpOptions)
      .pipe(
        tap(() => {
          this.storageService.clean();
          this.currentUserSubject.next(null);
          this.loggedInSubject.next(false);
          this.router.navigate(['/login']);
        })
      );
  }

  register(payload: {
    username: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/register`,
      payload,
      this.httpOptions
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$;
  }
}
