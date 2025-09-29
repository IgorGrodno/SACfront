import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Session } from '../../interfaces/session.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionUrl = `${environment.apiUrl}/sessions`;

  constructor(private readonly http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.sessionUrl);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.sessionUrl}/${id}`);
  }

  getActiveSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.sessionUrl}/active`);
  }

  createSession(session: Omit<Session, 'id'>): Observable<Session> {
    return this.http.post<Session>(this.sessionUrl, session);
  }

  updateSession(id: number, session: Partial<Session>): Observable<Session> {
    return this.http.put<Session>(`${this.sessionUrl}/${id}`, session);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sessionUrl}/${id}`);
  }

  activateSession(id: number, active: boolean): Observable<Session> {
    return this.http.patch<Session>(`${this.sessionUrl}/${id}/${active}`, {
      active,
    });
  }
}
