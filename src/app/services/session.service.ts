import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Session } from '../interfaces/session.interface';

const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionUrl = 'http://localhost:8080/api/sessions';

  constructor(private readonly http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.sessionUrl, readonlyHttpOptions);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(
      `${this.sessionUrl}/${id}`,
      readonlyHttpOptions
    );
  }

  getActiveSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.sessionUrl}/active`,
      readonlyHttpOptions
    );
  }

  createSession(session: Session): Observable<Session> {
    return this.http.post<Session>(
      this.sessionUrl,
      session,
      readonlyHttpOptions
    );
  }

  updateSession(id: number, session: Session): Observable<Session> {
    return this.http.put<Session>(
      `${this.sessionUrl}/${id}`,
      session,
      readonlyHttpOptions
    );
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.sessionUrl}/${id}`,
      readonlyHttpOptions
    );
  }
}
