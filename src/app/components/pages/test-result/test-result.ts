import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { SkillTestResultsService } from '../../../services/skill-test-results.service';
import { SessionService } from '../../../services/session.service';
import { SkillService } from '../../../services/skill.service';
import { ProfileService } from '../../../services/profile.service';
import { StepScoreEntry } from '../../../interfaces/stepScoreEntry.interface';
import { DisciplineService } from '../../../services/discipline.service';

interface TestResultView {
  id: number;
  sessionName: string;
  skillName: string;
  disciplineName: string;
  studentId: number;
  teacherName: string;
  score: number;
  resultDate: Date;
}

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-result.html',
  styleUrls: ['./test-result.css'],
})
export class TestResult implements OnInit {
  results: TestResultView[] = [];
  isLoading = false;
  sessionId?: string;

  activeTab: 'all' | 'students' | 'skills' | 'disciplines' = 'all';

  sortColumn: keyof TestResultView | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedSkill?: string;
  selectedDiscipline?: string;

  uniqueStudents: number[] = [];
  uniqueSkills: string[] = [];
  uniqueDisciplines: string[] = [];

  filterForm: FormGroup;
  minStudentId = 0;
  maxStudentId = 0;

  constructor(
    private route: ActivatedRoute,
    private resultsService: SkillTestResultsService,
    private sessionService: SessionService,
    private skillService: SkillService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private disciplineService: DisciplineService
  ) {
    this.filterForm = this.fb.group(
      {
        from: [
          1,
          [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
        ],
        to: [
          5000,
          [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
        ],
      },
      { validators: this.rangeValidator }
    );

    this.filterForm.valueChanges.subscribe(() =>
      this.recalculateUniqueValues()
    );
  }

  private rangeValidator(group: FormGroup) {
    const from = Number(group.get('from')?.value);
    const to = Number(group.get('to')?.value);
    return from && to && to >= from ? null : { rangeInvalid: true };
  }

  ngOnInit(): void {
    this.loadResults();
  }

  private loadResults(): void {
    this.isLoading = true;
    this.sessionId = this.route.snapshot.paramMap.get('id') ?? undefined;

    const request$ = this.sessionId
      ? this.resultsService.getBySessionId(Number(this.sessionId))
      : this.resultsService.getAll();

    request$.subscribe({
      next: (data) =>
        data?.length ? this.handleResults(data) : this.resetResults(),
      error: (err) => {
        console.error('Ошибка при загрузке результатов', err);
        this.resetResults();
      },
    });
  }

  private async handleResults(data: any[]): Promise<void> {
    try {
      const sessionIds = [...new Set(data.map((r) => r.sessionId))];
      const skillIds = [...new Set(data.map((r) => r.skillId))];
      const teacherIds = [...new Set(data.map((r) => r.teacherId))];

      const [sessions, skills, teachers, disciplines] = await Promise.all([
        Promise.all(
          sessionIds.map((id) =>
            firstValueFrom(this.sessionService.getSessionById(id))
          )
        ),
        Promise.all(
          skillIds.map((id) => firstValueFrom(this.skillService.getSkill(id)))
        ),
        Promise.all(
          teacherIds.map((id) =>
            firstValueFrom(this.profileService.getProfile(id))
          )
        ),
        firstValueFrom(this.disciplineService.getDisciplines()),
      ]);

      const sessionMap = new Map(
        sessionIds.map((id, i) => [id, sessions[i]?.name ?? ''])
      );
      const skillMap = new Map(
        skillIds.map((id, i) => [id, skills[i] ?? null])
      );
      const teacherMap = new Map(
        teacherIds.map((id, i) => [
          id,
          teachers[i]
            ? `${teachers[i].firstName ?? ''} ${teachers[i].secondName ?? ''} ${
                teachers[i].fatherName ?? ''
              }`.trim()
            : '',
        ])
      );

      const skillToDisciplineMap = new Map<number, string>();
      disciplines.forEach((d) =>
        d.skills?.forEach((s) => skillToDisciplineMap.set(s.id, d.name))
      );

      this.results = data
        .map((r) => {
          const skill = skillMap.get(r.skillId);
          const disciplineName = skill
            ? skillToDisciplineMap.get(skill.id) ?? ''
            : '';

          return {
            id: r.id ?? 0,
            sessionName: sessionMap.get(r.sessionId) || '',
            skillName: skill?.name ?? '',
            disciplineName,
            studentId: r.studentId,
            teacherName: teacherMap.get(r.teacherId) || '',
            score: this.calculateScore(r.stepScores),
            resultDate: new Date(r.resultDate),
          };
        })
        .sort((a, b) => b.resultDate.getTime() - a.resultDate.getTime());

      const allStudents = [
        ...new Set(this.results.map((r) => r.studentId)),
      ].sort((a, b) => a - b);
      this.minStudentId = allStudents[0];
      this.maxStudentId = allStudents[allStudents.length - 1];
      this.filterForm.patchValue({
        from: this.minStudentId,
        to: this.maxStudentId,
      });

      this.recalculateUniqueValues();
    } catch (e) {
      console.error('Ошибка при загрузке связанных данных', e);
      this.resetResults();
    } finally {
      this.isLoading = false;
    }
  }

  private recalculateUniqueValues(): void {
    const filtered = this.filteredResults;

    this.uniqueStudents = [...new Set(filtered.map((r) => r.studentId))].sort(
      (a, b) => a - b
    );
    this.uniqueSkills = [...new Set(filtered.map((r) => r.skillName))].sort(
      (a, b) => a.localeCompare(b)
    );
    this.uniqueDisciplines = [
      ...new Set(filtered.map((r) => r.disciplineName)),
    ];
  }

  private resetResults(): void {
    this.results = [];
    this.uniqueStudents = [];
    this.uniqueSkills = [];
    this.uniqueDisciplines = [];
    this.isLoading = false;
  }

  get filteredResults(): TestResultView[] {
    const { from, to } = this.filterForm.value;
    return this.results.filter((r) => r.studentId >= from && r.studentId <= to);
  }

  private calculateScore(stepScores: StepScoreEntry[]): number {
    if (!stepScores?.length) return 0;
    const total = stepScores.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round((Math.max(total, 0) / (stepScores.length * 2)) * 100);
  }

  setActiveTab(tab: 'all' | 'students' | 'skills' | 'disciplines'): void {
    this.activeTab = tab;
    this.selectedSkill = undefined;
    this.selectedDiscipline = undefined;
  }

  getScoreForStudentSkill(studentId: number, skillName: string): number | null {
    const result = this.filteredResults.find(
      (r) => r.studentId === studentId && r.skillName === skillName
    );
    return result ? result.score : null;
  }

  getResultsForSelectedSkill(): TestResultView[] {
    return this.selectedSkill
      ? this.filteredResults.filter((r) => r.skillName === this.selectedSkill)
      : [];
  }

  getAverageScoreForSkill(skill: string): number {
    const skillResults = this.filteredResults.filter(
      (r) =>
        r.skillName === skill && this.filteredStudents.includes(r.studentId)
    );
    if (!skillResults.length) return 0;
    return Math.round(
      skillResults.reduce((sum, r) => sum + r.score, 0) / skillResults.length
    );
  }

  getAverageScoreForDiscipline(discipline: string): number {
    const disciplineResults = this.filteredResults.filter(
      (r) => r.disciplineName === discipline
    );
    if (!disciplineResults.length) return 0;
    return Math.round(
      disciplineResults.reduce((sum, r) => sum + r.score, 0) /
        disciplineResults.length
    );
  }

  sortBy(column: keyof TestResultView): void {
    this.sortDirection =
      this.sortColumn === column && this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';
    this.sortColumn = column;

    this.results.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return this.sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  get filteredStudents(): number[] {
    const { from, to } = this.filterForm.value;
    return this.uniqueStudents.filter((id) => id >= from && id <= to);
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key))
      event.preventDefault();
  }
}
