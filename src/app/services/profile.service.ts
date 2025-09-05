import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../interfaces/profile.interface';
import { Discipline } from '../interfaces/discipline.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly baseUrl = 'http://localhost:8080/api/profile';

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private readonly http: HttpClient) {}

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`, this.httpOptions);
  }

  updateProfile(
    profile: Profile,
    disciplines: Discipline[]
  ): Observable<Profile> {
    const payload = { profile, disciplines };
    console.log('Updating profile with payload:', payload);
    return this.http.put<Profile>(
      `${this.baseUrl}/${profile.id}`,
      payload,
      this.httpOptions // 🔹 добавлено!
    );
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.httpOptions);
  }
}
