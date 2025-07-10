import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { RegisterResponse } from '../interfaces/registerResponse.interface';
import { User } from '../interfaces/user.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public loggedIn$ = this.loggedInSubject.asObservable();

  router: Router = inject(Router);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    const storedUser = this.storageService.getUser();
    if (storedUser && storedUser.username) {
      this.currentUserSubject.next(storedUser);
      this.loggedInSubject.next(true);
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

  login(payload: { username: string; password: string }): Observable<User> {
    return this.http
      .post<User>(this.authUrl + '/signin', payload, httpOptions)
      .pipe(
        tap((user: User) => {
          this.setCurrentUser(user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(this.authUrl + '/signout', {}, httpOptions).pipe(
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
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      this.authUrl + '/newuserregister',
      payload,
      httpOptions
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$;
  }
}
