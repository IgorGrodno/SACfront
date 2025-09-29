import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SkillTestResult } from '../../interfaces/skillTestResult.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SkillTestResultsService {
  private baseUrl = `${environment.apiUrl}/skill-test-results`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SkillTestResult[]> {
    return this.http.get<SkillTestResult[]>(this.baseUrl);
  }

  getBySessionId(sessionId: number): Observable<SkillTestResult[]> {
    return this.http.get<SkillTestResult[]>(
      `${this.baseUrl}/session/${sessionId}`
    );
  }

  getById(id: number): Observable<SkillTestResult> {
    return this.http.get<SkillTestResult>(`${this.baseUrl}/${id}`);
  }

  create(result: SkillTestResult): Observable<SkillTestResult> {
    return this.http.post<SkillTestResult>(this.baseUrl, result);
  }

  update(id: number, result: SkillTestResult): Observable<SkillTestResult> {
    return this.http.put<SkillTestResult>(`${this.baseUrl}/${id}`, result);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
