import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  private authUrl = 'http://localhost:8080/api/admin';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.authUrl + '/users', httpOptions);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.authUrl}/deleteuser/${userId}`,
      httpOptions
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(this.authUrl + '/user', user, httpOptions);
  }
}
