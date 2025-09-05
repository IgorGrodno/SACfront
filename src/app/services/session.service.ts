import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Session } from '../interfaces/session.interface';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionUrl = 'http://localhost:8080/api/sessions';

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private readonly http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.sessionUrl, this.httpOptions);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.sessionUrl}/${id}`, this.httpOptions);
  }

  getActiveSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.sessionUrl}/active`,
      this.httpOptions
    );
  }

  createSession(session: Omit<Session, 'id'>): Observable<Session> {
    return this.http.post<Session>(this.sessionUrl, session, this.httpOptions);
  }

  updateSession(id: number, session: Partial<Session>): Observable<Session> {
    return this.http.put<Session>(
      `${this.sessionUrl}/${id}`,
      session,
      this.httpOptions
    );
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sessionUrl}/${id}`, this.httpOptions);
  }

  activateSession(id: number, active: boolean): Observable<Session> {
    return this.http.patch<Session>(
      `${this.sessionUrl}/${id}/${active}`,
      { active },
      this.httpOptions
    );
  }
}
