import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/api/users';

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private readonly http: HttpClient) {}

  // 🔹 Получить всех пользователей
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, this.httpOptions);
  }

  // 🔹 Получить пользователя по id
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`, this.httpOptions);
  }

  // 🔹 Создать нового пользователя
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user, this.httpOptions);
  }

  // 🔹 Обновить пользователя
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}`, user, this.httpOptions);
  }

  // 🔹 Удалить пользователя
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${userId}`,
      this.httpOptions
    );
  }
}
