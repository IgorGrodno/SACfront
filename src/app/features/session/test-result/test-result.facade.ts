import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { DisciplineService } from '../../discipline/discipline.service';
import { SkillService } from '../../skill/skill.service';
import { SessionService } from '../session.service';
import { SkillTestResultsService } from '../skill-test-results.service';

import { TestResultView } from './test-result.model';

interface SkillView {
  name: string;
  avg: number;
}

interface DisciplineView {
  name: string;
  avg: number;
  skills: SkillView[];
}

interface StudentView {
  id: number;
  avg: number;
  scores: Record<string, number | null>;
}

@Injectable({ providedIn: 'root' })
export class TestResultFacade {
  private resultsSubject = new BehaviorSubject<TestResultView[]>([]);
  results$ = this.resultsSubject.asObservable().pipe(shareReplay(1));

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private studentRangeSubject = new BehaviorSubject<{
    from: number | null;
    to: number | null;
  }>({ from: null, to: null });
  setStudentRange(range: { from: number | null; to: number | null }) {
    this.studentRangeSubject.next(range);
  }

  /** Дисциплины с навыками и средними значениями */
  uniqueDisciplines$ = this.results$.pipe(
    map((results) => {
      const disciplines = Array.from(
        new Set(results.map((r) => r.disciplineName))
      ).sort();
      return disciplines.map((discipline) => {
        const disciplineResults = results.filter(
          (r) => r.disciplineName === discipline
        );
        const avg = this.calcAverage(disciplineResults.map((r) => r.score));
        const skills = Array.from(
          new Set(disciplineResults.map((r) => r.skillName))
        ).sort();
        const skillObjects = skills.map((skill) => ({
          name: skill,
          avg: this.calcAverage(
            disciplineResults
              .filter((r) => r.skillName === skill)
              .map((r) => r.score)
          ),
        }));
        return { name: discipline, avg, skills: skillObjects };
      });
    }),
    shareReplay(1)
  );

  /** Студенты с фильтром по диапазону */
  filteredStudents$ = combineLatest([
    this.results$,
    this.studentRangeSubject,
  ]).pipe(
    map(([results, range]) => {
      const students = Array.from(
        new Set(results.map((r) => r.studentId))
      ).sort((a, b) => a - b);
      const filtered = students.filter(
        (s) =>
          (range.from === null || s >= range.from) &&
          (range.to === null || s <= range.to)
      );

      return filtered.map((studentId) => {
        const studentResults = results.filter((r) => r.studentId === studentId);
        const avg = this.calcAverage(studentResults.map((r) => r.score));
        const scores: Record<string, number | null> = {};
        studentResults.forEach((r) => (scores[r.skillName] = r.score));
        return { id: studentId, avg, scores };
      });
    }),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    private resultsService: SkillTestResultsService,
    private sessionService: SessionService,
    private skillService: SkillService,
    private disciplineService: DisciplineService
  ) {}

  loadResults() {
    this.loadingSubject.next(true);
    const sessionId = this.route.snapshot.paramMap.get('id');
    const request$ = sessionId
      ? this.resultsService.getBySessionId(+sessionId)
      : this.resultsService.getAll();

    request$
      .pipe(
        switchMap((data) => (data?.length ? this.enrichResults(data) : of([]))),
        catchError(() => of([]))
      )
      .subscribe((results) => {
        this.resultsSubject.next(results);
        this.loadingSubject.next(false);
      });
  }

  private enrichResults(data: any[]) {
    const sessionIds = Array.from(new Set(data.map((r) => r.sessionId)));
    const skillIds = Array.from(new Set(data.map((r) => r.skillId)));

    return combineLatest([
      combineLatest(
        sessionIds.map((id) => this.sessionService.getSessionById(id))
      ),
      combineLatest(skillIds.map((id) => this.skillService.getSkill(id))),
      this.disciplineService.getDisciplines(),
    ]).pipe(
      map(([sessions, skills, disciplines]) => {
        const sessionMap = new Map(
          sessionIds.map((id, i) => [id, sessions[i]?.name || ''])
        );
        const skillMap = new Map(skillIds.map((id, i) => [id, skills[i]]));
        const skillToDiscipline = new Map<number, string>();
        disciplines.forEach((d) =>
          d.skills?.forEach((s) => skillToDiscipline.set(s.id, d.name))
        );

        return data
          .map((r) => {
            const skill = skillMap.get(r.skillId);
            return {
              id: r.id ?? 0,
              sessionName: sessionMap.get(r.sessionId) || '',
              skillName: skill?.name ?? '',
              disciplineName: skill
                ? skillToDiscipline.get(skill.id) || ''
                : '',
              studentId: r.studentId,
              score: this.calculateScore(r.stepScores),
              resultDate: new Date(r.resultDate),
            } as TestResultView;
          })
          .sort((a, b) => b.resultDate.getTime() - a.resultDate.getTime());
      })
    );
  }

  private calculateScore(stepScores: { score: number }[]): number {
    if (!stepScores?.length) return 0;
    const total = stepScores.reduce((sum, s) => sum + s.score, 0);
    return Math.round((Math.max(total, 0) / (stepScores.length * 2)) * 100);
  }

  private calcAverage(scores: number[]): number {
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  }

  exportToExcel(results: TestResultView[], filename = 'Студенты.xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Студенты');

    const disciplines = Array.from(
      new Set(results.map((r) => r.disciplineName))
    ).sort();
    const disciplineToSkills = new Map<string, string[]>();
    disciplines.forEach((d) =>
      disciplineToSkills.set(
        d,
        Array.from(
          new Set(
            results
              .filter((r) => r.disciplineName === d)
              .map((r) => r.skillName)
          )
        ).sort()
      )
    );

    const students = Array.from(new Set(results.map((r) => r.studentId))).sort(
      (a, b) => a - b
    );

    // Заголовки
    const header1: string[] = [''];
    const header2: string[] = ['Студент'];
    disciplines.forEach((discipline) => {
      const skills = disciplineToSkills.get(discipline) ?? [];
      const colspan = Math.max(skills.length, 1);
      header1.push(
        `${discipline} (${this.calcAverage(
          results
            .filter((r) => r.disciplineName === discipline)
            .map((r) => r.score)
        )}%)`
      );
      for (let i = 1; i < colspan; i++) header1.push('');
      if (skills.length)
        skills.forEach((skill) =>
          header2.push(
            `${skill} (${this.calcAverage(
              results.filter((r) => r.skillName === skill).map((r) => r.score)
            )}%)`
          )
        );
      else header2.push('');
    });
    header1.push('');
    header2.push('Среднее по студенту');
    worksheet.addRow(header1);
    worksheet.addRow(header2);

    // Merge cells
    let colIndex = 2;
    disciplines.forEach((discipline) => {
      const skills = disciplineToSkills.get(discipline) ?? [];
      const colspan = Math.max(skills.length, 1);
      if (colspan > 1)
        worksheet.mergeCells(1, colIndex, 1, colIndex + colspan - 1);
      colIndex += colspan;
    });

    // Данные студентов
    students.forEach((studentId) => {
      const row: (string | number)[] = [studentId];
      disciplines.forEach((discipline) => {
        const skills = disciplineToSkills.get(discipline) ?? [];
        if (!skills.length) row.push('-');
        else
          skills.forEach((skill) => {
            const score =
              results.find(
                (r) => r.studentId === studentId && r.skillName === skill
              )?.score ?? '-';
            row.push(score);
          });
      });
      row.push(
        this.calcAverage(
          results.filter((r) => r.studentId === studentId).map((r) => r.score)
        )
      );
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((col) => (col.width = 15));
    worksheet.eachRow((row) =>
      row.eachCell(
        (cell) =>
          (cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          })
      )
    );

    return from(
      workbook.xlsx
        .writeBuffer()
        .then((buffer) => saveAs(new Blob([buffer]), filename))
    );
  }
}
