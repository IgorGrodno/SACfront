import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SkillTestResult } from '../../interfaces/skillTestResult.interface';
import { environment } from '../../../environments/environment';
const readonlyHttpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private readonly examUrl = `${environment.apiUrl}/skill-test-results`;

  constructor(private readonly http: HttpClient) {}

  // ===== Получить все результаты =====
  getAllResults(): Observable<SkillTestResult[]> {
    return this.http.get<SkillTestResult[]>(this.examUrl, readonlyHttpOptions);
  }

  // ===== Получить результат по ID =====
  getResultById(id: number): Observable<SkillTestResult> {
    return this.http.get<SkillTestResult>(
      `${this.examUrl}/${id}`,
      readonlyHttpOptions
    );
  }

  // ===== Создать новый результат =====
  createResult(dto: SkillTestResult): Observable<SkillTestResult> {
    return this.http.post<SkillTestResult>(
      this.examUrl,
      dto,
      readonlyHttpOptions
    );
  }

  // ===== Обновить существующий результат =====
  updateResult(id: number, dto: SkillTestResult): Observable<SkillTestResult> {
    return this.http.put<SkillTestResult>(
      `${this.examUrl}/${id}`,
      dto,
      readonlyHttpOptions
    );
  }

  // ===== Удалить результат =====
  deleteResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.examUrl}/${id}`, readonlyHttpOptions);
  }
}
