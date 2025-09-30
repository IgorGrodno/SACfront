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

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DisciplineService } from '../../discipline/discipline.service';
import { SkillService } from '../../skill/skill.service';
import { ProfileService } from '../../user/profile.service';
import { SessionService } from '../session.service';
import { SkillTestResultsService } from '../skill-test-results.service';

interface TestResultView {
  id: number;
  sessionName: string;
  skillName: string;
  disciplineName: string;
  studentId: number;
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

  uniqueStudents: number[] = [];
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
      error: () => this.resetResults(),
    });
  }

  private async handleResults(data: any[]): Promise<void> {
    try {
      const sessionIds = [...new Set(data.map((r) => r.sessionId))];
      const skillIds = [...new Set(data.map((r) => r.skillId))];

      const [sessions, skills, disciplines] = await Promise.all([
        Promise.all(
          sessionIds.map((id) =>
            firstValueFrom(this.sessionService.getSessionById(id))
          )
        ),
        Promise.all(
          skillIds.map((id) => firstValueFrom(this.skillService.getSkill(id)))
        ),
        firstValueFrom(this.disciplineService.getDisciplines()) as Promise<
          { id: number; name: string; skills: { id: number; name: string }[] }[]
        >,
      ]);

      // Declare and initialize the skillToDisciplineMap
      const skillToDisciplineMap = new Map<number, string>();

      const sessionMap = new Map(
        sessionIds.map((id, i) => [id, sessions[i]?.name ?? ''])
      );
      const skillMap = new Map(
        skillIds.map((id, i) => [id, skills[i] ?? null])
      );
      (disciplines ?? []).forEach(
        (d: {
          id: number;
          name: string;
          skills: { id: number; name: string }[];
        }) =>
          d.skills?.forEach((s: { id: number; name: string }) =>
            skillToDisciplineMap.set(s.id, d.name)
          )
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
    } catch {
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
    this.uniqueDisciplines = [
      ...new Set(filtered.map((r) => r.disciplineName)),
    ];
  }

  private resetResults(): void {
    this.results = [];
    this.uniqueStudents = [];
    this.uniqueDisciplines = [];
    this.isLoading = false;
  }

  get filteredResults(): TestResultView[] {
    const { from, to } = this.filterForm.value;
    return this.results.filter((r) => r.studentId >= from && r.studentId <= to);
  }

  private calculateScore(stepScores: { score: number }[]): number {
    if (!stepScores?.length) return 0;
    const total = stepScores.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round((Math.max(total, 0) / (stepScores.length * 2)) * 100);
  }

  getScoreForStudentSkill(studentId: number, skillName: string): number | null {
    const result = this.filteredResults.find(
      (r) => r.studentId === studentId && r.skillName === skillName
    );
    return result ? result.score : null;
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

  getAverageScoreForStudent(studentId: number): number {
    const studentResults = this.filteredResults.filter(
      (r) => r.studentId === studentId
    );
    if (!studentResults.length) return 0;
    return Math.round(
      studentResults.reduce((sum, r) => sum + r.score, 0) /
        studentResults.length
    );
  }

  getAverageScoreForSkillAcrossStudents(skill: string): number {
    const skillResults = this.filteredResults.filter(
      (r) => r.skillName === skill
    );
    if (!skillResults.length) return 0;
    return Math.round(
      skillResults.reduce((sum, r) => sum + r.score, 0) / skillResults.length
    );
  }

  get filteredStudents(): number[] {
    return this.uniqueStudents.filter(
      (studentId) =>
        studentId >= this.filterForm.value.from &&
        studentId <= this.filterForm.value.to
    );
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];
    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key))
      event.preventDefault();
  }

  getSkillsForDiscipline(discipline: string): { name: string; avg: number }[] {
    const skills = this.filteredResults
      .filter((r) => r.disciplineName === discipline)
      .map((r) => r.skillName);
    const uniqueSkills = [...new Set(skills)].sort();

    return uniqueSkills.map((skill) => ({
      name: skill,
      avg: this.getAverageScoreForSkillAcrossStudents(skill),
    }));
  }

  async exportStudentsByDisciplineExcel(filename = 'Студенты.xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Студенты');

    const header1: string[] = [''];
    const header2: string[] = ['Студент'];

    this.uniqueDisciplines.forEach((discipline) => {
      const skillsWithAvg = this.getSkillsForDiscipline(discipline);
      const colspan = Math.max(skillsWithAvg.length, 1);

      header1.push(
        `${discipline} (${this.getAverageScoreForDiscipline(discipline)}%)`
      );
      for (let i = 1; i < colspan; i++) header1.push('');

      if (skillsWithAvg.length)
        skillsWithAvg.forEach((skill) =>
          header2.push(`${skill.name} (${skill.avg}%)`)
        );
      else header2.push('');
    });

    header1.push('');
    header2.push('Среднее по студенту');

    worksheet.addRow(header1);
    worksheet.addRow(header2);

    let colIndex = 2;
    this.uniqueDisciplines.forEach((discipline) => {
      const skillsWithAvg = this.getSkillsForDiscipline(discipline);
      const colspan = Math.max(skillsWithAvg.length, 1);
      if (colspan > 1)
        worksheet.mergeCells(1, colIndex, 1, colIndex + colspan - 1);
      colIndex += colspan;
    });

    this.filteredStudents.forEach((studentId) => {
      const row: (string | number)[] = [studentId];
      this.uniqueDisciplines.forEach((discipline) => {
        const skillsWithAvg = this.getSkillsForDiscipline(discipline);
        if (!skillsWithAvg.length) row.push('-');
        else
          skillsWithAvg.forEach((skill) => {
            const score = this.getScoreForStudentSkill(studentId, skill.name);
            row.push(score !== null ? score : '-');
          });
      });
      row.push(this.getAverageScoreForStudent(studentId));
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((col) => (col.width = 15));
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
  }
}
