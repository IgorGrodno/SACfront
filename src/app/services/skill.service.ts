import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Skill } from '../interfaces/skill.interface';
import { SkillTestResult } from '../interfaces/skillTestResult.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private skillUrl = 'fakeDB/SkillDB.json';

  constructor(private http: HttpClient) {}

  getSkill(skillId: number): Observable<Skill> {
    return this.http.get<{ skills: Skill[] }>(this.skillUrl).pipe(
      map((data) => {
        const skill = data.skills.find((s) => s.id === skillId);
        if (!skill) {
          throw new Error('Skill not found');
        }
        return skill;
      })
    );
  }

  getAllSkills(): Observable<Skill[]> {
    return this.http
      .get<{ skills: Skill[] }>(this.skillUrl)
      .pipe(map((data) => data.skills));
  }

  sendTestResult(result: SkillTestResult): Observable<SkillTestResult> {
    return new Observable<SkillTestResult>((observer) => {
      observer.next(result);
      observer.complete();
    });
  }
}
