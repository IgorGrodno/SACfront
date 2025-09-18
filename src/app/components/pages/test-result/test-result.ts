import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SkillTestResultsService } from '../../../services/skill-test-results.service';
import { SessionService } from '../../../services/session.service';
import { SkillService } from '../../../services/skill.service';
import { ProfileService } from '../../../services/profile.service';
import { StepScoreEntry } from '../../../interfaces/stepScoreEntry.interface';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

interface TestResultView {
  id: number;
  sessionName: string;
  skillName: string;
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

  activeTab: 'all' | 'students' | 'skills' = 'all';

  sortColumn: keyof TestResultView | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedStudentId?: number;
  uniqueStudents: number[] = [];

  // ✅ Новое состояние для вкладки "Дисциплины"
  uniqueSkills: string[] = [];
  selectedSkill?: string;

  constructor(
    private route: ActivatedRoute,
    private resultsService: SkillTestResultsService,
    private sessionService: SessionService,
    private skillService: SkillService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;

    this.sessionId = this.route.snapshot.paramMap.get('id') ?? undefined;
    const request$ = this.sessionId
      ? this.resultsService.getBySessionId(Number(this.sessionId))
      : this.resultsService.getAll();

    request$.subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.results = [];
          this.isLoading = false;
          return;
        }

        const sessionIds = [...new Set(data.map((r) => r.sessionId))];
        const skillIds = [...new Set(data.map((r) => r.skillId))];
        const teacherIds = [...new Set(data.map((r) => r.teacherId))];

        Promise.all([
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
        ])
          .then(([sessions, skills, teachers]) => {
            const sessionMap = new Map(
              sessionIds.map((id, i) => [id, sessions[i]?.name ?? ''])
            );
            const skillMap = new Map(
              skillIds.map((id, i) => [id, skills[i]?.name ?? ''])
            );
            const teacherMap = new Map(
              teacherIds.map((id, i) => [
                id,
                teachers[i]
                  ? `${teachers[i].firstName ?? ''} ${
                      teachers[i].secondName ?? ''
                    } ${teachers[i].fatherName ?? ''}`.trim()
                  : '',
              ])
            );

            this.results = data
              .map((result) => ({
                id: result.id ?? 0,
                sessionName: sessionMap.get(result.sessionId) || '',
                skillName: skillMap.get(result.skillId) || '',
                studentId: result.studentId,
                teacherName: teacherMap.get(result.teacherId) || '',
                score: this.calculateScore(result.stepScores),
                resultDate: new Date(result.resultDate),
              }))
              .sort((a, b) => b.resultDate.getTime() - a.resultDate.getTime());

            this.uniqueStudents = [
              ...new Set(this.results.map((r) => r.studentId)),
            ];
            this.uniqueSkills = [
              ...new Set(this.results.map((r) => r.skillName)),
            ];
          })
          .catch((err) =>
            console.error('Ошибка при загрузке связанных данных', err)
          )
          .finally(() => (this.isLoading = false));
      },
      error: (err) => {
        console.error('Ошибка при загрузке результатов', err);
        this.results = [];
        this.isLoading = false;
      },
    });
  }

  async deleteResult(result: TestResultView) {
    if (!confirm(`Удалить результат студента ${result.studentId}?`)) return;
    this.isLoading = true;
    try {
      await firstValueFrom(this.resultsService.delete(result.id));
      this.results = this.results.filter((r) => r.id !== result.id);
    } finally {
      this.isLoading = false;
    }
  }

  private calculateScore(stepScores: StepScoreEntry[]): number {
    if (!stepScores || stepScores.length === 0) return 0;
    const maxPossible = stepScores.length * 2;
    const total = stepScores.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round((Math.max(total, 0) / maxPossible) * 100);
  }

  async exportToExcel(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Результаты');

    worksheet.columns = [
      { header: 'Сессия', key: 'session' },
      { header: 'Навык', key: 'skill' },
      { header: 'Студент', key: 'student' },
      { header: 'Преподаватель', key: 'teacher' },
      { header: 'Результат', key: 'result' },
      { header: 'Дата', key: 'date' },
    ];

    this.results.forEach((r) =>
      worksheet.addRow({
        session: r.sessionName,
        skill: r.skillName,
        student: r.studentId,
        teacher: r.teacherName,
        result: `${r.score}%`,
        date: r.resultDate,
      })
    );

    worksheet.getRow(1).font = { bold: true };
    worksheet.getColumn('date').numFmt = 'dd.mm.yyyy';
    worksheet.getColumn('skill').alignment = { wrapText: true };
    worksheet.getColumn('teacher').alignment = { wrapText: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Результаты_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  sortBy(column: keyof TestResultView): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.results.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];
      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      valueA = valueA?.toString().toLowerCase() ?? '';
      valueB = valueB?.toString().toLowerCase() ?? '';
      return this.sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }

  setActiveTab(tab: 'all' | 'students' | 'skills') {
    this.activeTab = tab;
    this.selectedStudentId = undefined;
    this.selectedSkill = undefined;
  }

  selectStudent(studentId: number) {
    this.selectedStudentId = studentId;
  }

  getResultsForSelectedStudent() {
    if (!this.selectedStudentId) return [];
    return this.results.filter((r) => r.studentId === this.selectedStudentId);
  }

  selectSkill(skill: string) {
    this.selectedSkill = skill;
  }

  getResultsForSelectedSkill() {
    if (!this.selectedSkill) return [];
    return this.results.filter((r) => r.skillName === this.selectedSkill);
  }

  // Средний результат по выбранной дисциплине
  getAverageScoreForSkill(skill: string): number {
    const skillResults = this.results.filter((r) => r.skillName === skill);
    if (skillResults.length === 0) return 0;
    const total = skillResults.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / skillResults.length);
  }

  // Средний результат для отображения в таблице студентов по выбранной дисциплине
  getAverageScoreForSelectedSkill(): number {
    return this.selectedSkill
      ? this.getAverageScoreForSkill(this.selectedSkill)
      : 0;
  }

  getStudentCountForSkill(skill: string): number {
    return this.results
      ? this.results.filter((r) => r.skillName === skill).length
      : 0;
  }
}
