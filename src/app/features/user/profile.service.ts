import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../../interfaces/profile.interface';
import { Discipline } from '../../interfaces/discipline.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiUrl}/profile`;

  constructor(private readonly http: HttpClient) {}

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  updateProfile(
    profile: Profile,
    disciplines: Discipline[]
  ): Observable<Profile> {
    const payload = { profile, disciplines };
    console.log('Updating profile with payload:', payload);
    return this.http.put<Profile>(`${this.baseUrl}/${profile.id}`, payload);
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
