import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { Observable } from 'rxjs/internal/Observable';
import { Skill } from '../interfaces/skill.interface';
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
    const payload = {
      profile,
      disciplines,
    };
    console.log('Updating profile with payload:', payload);
    return this.http.put<Profile>(`${this.baseUrl}/${profile.id}`, payload);
  }

  deleteProfile(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.httpOptions);
  }
}
