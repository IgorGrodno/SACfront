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
    if (this.sessionId) {
      console.log('Loading results for session ID:', this.sessionId);
      this.resultsService.getBySessionId(Number(this.sessionId)).subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.results = [];
            this.isLoading = false;
            return;
          }

          const sessionIds = [...new Set(data.map((r) => r.sessionId))];
          const skillIds = [...new Set(data.map((r) => r.skillId))];
          const teacherIds = [...new Set(data.map((r) => r.teacherId))];

          // параллельные запросы
          Promise.all([
            Promise.all(
              sessionIds.map((id) =>
                firstValueFrom(this.sessionService.getSessionById(id))
              )
            ),
            Promise.all(
              skillIds.map((id) =>
                firstValueFrom(this.skillService.getSkill(id))
              )
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
                .sort(
                  (a, b) => b.resultDate.getTime() - a.resultDate.getTime()
                );
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
    } else {
      console.log('Loading all results');
      this.resultsService.getAll().subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.results = [];
            this.isLoading = false;
            return;
          }

          const sessionIds = [...new Set(data.map((r) => r.sessionId))];
          const skillIds = [...new Set(data.map((r) => r.skillId))];
          const teacherIds = [...new Set(data.map((r) => r.teacherId))];

          // параллельные запросы
          Promise.all([
            Promise.all(
              sessionIds.map((id) =>
                firstValueFrom(this.sessionService.getSessionById(id))
              )
            ),
            Promise.all(
              skillIds.map((id) =>
                firstValueFrom(this.skillService.getSkill(id))
              )
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
                .sort(
                  (a, b) => b.resultDate.getTime() - a.resultDate.getTime()
                );
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
  }

  async deleteResult(result: TestResultView) {
    if (!confirm(`Удалить результат студента ${result.studentId}?`)) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.resultsService.delete(result.id));
      this.results = this.results.filter((r) => r.id !== result.id);
      console.log(`Результат студента ${result.studentId} удалён`);
    } catch (err) {
      console.error('Ошибка при удалении результата', err);
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

    this.results.forEach((r) => {
      worksheet.addRow({
        session: r.sessionName,
        skill: r.skillName,
        student: r.studentId,
        teacher: r.teacherName,
        result: `${r.score}%`,
        date:
          r.resultDate instanceof Date ? r.resultDate : new Date(r.resultDate),
      });
    });

    // Заголовок
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F3F3' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Формат колонки с датой
    worksheet.getColumn('date').numFmt = 'dd.mm.yyyy';

    // Выравнивание для отдельных колонок
    worksheet.getColumn('result').alignment = { horizontal: 'center' };
    worksheet.getColumn('student').alignment = { horizontal: 'center' };

    // ✅ Перенос текста в колонках "Преподаватель" и "Навык"
    worksheet.getColumn('teacher').alignment = {
      wrapText: true,
      vertical: 'middle',
    };
    worksheet.getColumn('skill').alignment = {
      wrapText: true,
      vertical: 'middle',
    };

    // Универсальное выравнивание по центру по вертикали
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { ...cell.alignment, vertical: 'middle' };
      });
    });

    // Автоширина
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      if (typeof column.eachCell === 'function') {
        column.eachCell({ includeEmpty: true }, (cell) => {
          let text = '';
          if (cell.value === null || cell.value === undefined) {
            text = '';
          } else if (cell.type === ExcelJS.ValueType.Date) {
            text = (cell.value as Date).toLocaleDateString('ru-RU');
          } else if (
            typeof cell.value === 'object' &&
            'text' in (cell.value as any)
          ) {
            text = (cell.value as any).text;
          } else {
            text = String(cell.value);
          }
          if (text.length > maxLength) maxLength = text.length;
        });
      }
      column.width = maxLength + 2;
    });

    // ✅ Минимальная высота строк (на 2 строки текста)
    worksheet.eachRow((row) => {
      if (!row.height || row.height < 30) {
        row.height = 30;
      }
    });

    // Сохранение
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `Результаты_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, filename);
  }
}
