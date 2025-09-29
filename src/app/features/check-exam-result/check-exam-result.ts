import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SkillService } from '../skill/skill.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Session } from '../../interfaces/session.interface';
import { DisciplineService } from '../discipline/discipline.service';
import { SessionService } from '../session/session.service';
import { SkillTestResultsService } from '../test-result/skill-test-results.service';

interface ResultView {
  studentId: number;
  skillName: string;
  disciplineName: string;
  score: number;
  stepScores: { stepId: number; score: number }[];
}

@Component({
  selector: 'app-check-exam-result',
  standalone: true,
  templateUrl: './check-exam-result.html',
  styleUrls: ['./check-exam-result.css'],
  imports: [CommonModule],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckExamResult implements OnInit {
  sessions = signal<Session[]>([]);
  activeSessionId = signal<number | null>(null);
  activeStudentNumber = signal<number | null>(null);
  sessionStudentNumbers = signal<number[]>([]);
  results: ResultView[] = [];

  uniqueDisciplines = signal<string[]>([]);

  students = computed(() => {
    const studentSet = new Set(
      this.results.filter((r) => r.studentId !== null).map((r) => r.studentId)
    );
    return this.sessionStudentNumbers().filter((s) => studentSet.has(s));
  });

  studentResults = computed(() => {
    if (!this.activeStudentNumber()) return [];
    return this.results.filter(
      (r) => r.studentId === this.activeStudentNumber()
    );
  });

  constructor(
    private sessionService: SessionService,
    private resultService: SkillTestResultsService,
    private disciplineService: DisciplineService,
    private skillService: SkillService
  ) {}

  async ngOnInit() {
    const sessions = await firstValueFrom(this.sessionService.getAllSessions());
    this.sessions.set(sessions);

    const firstActive = sessions.find((s) => s.active) ?? sessions[0];
    if (firstActive) this.selectSession(firstActive.id!);
  }

  async selectSession(sessionId: number) {
    this.activeSessionId.set(sessionId);

    // Загружаем результаты
    const rawResults = await firstValueFrom(
      this.resultService.getBySessionId(sessionId)
    );

    // Загружаем дисциплины и навыки
    const disciplines = await firstValueFrom(
      this.disciplineService.getDisciplines()
    );
    const skillsList = await firstValueFrom(this.skillService.getSkills());
    const skillMap = new Map(skillsList.map((s) => [s.id, s]));

    // Преобразуем результаты в плоскую структуру
    this.results = rawResults.map((r) => {
      const skill = skillMap.get(r.skillId);
      const discipline = disciplines.find((d) =>
        d.skills?.some((s) => s.id === r.skillId)
      );
      return {
        studentId: r.studentId,
        skillName: skill?.name ?? 'Неизвестно',
        disciplineName: discipline?.name ?? 'Неизвестно',
        stepScores: r.stepScores,
        score: this.calculateScore(r.stepScores),
      };
    });

    // Устанавливаем список студентов для этой сессии
    const session = await firstValueFrom(
      this.sessionService.getSessionById(sessionId)
    );
    this.sessionStudentNumbers.set(session.studentNumbers);

    // Выбираем первого студента, у которого есть результаты
    const availableStudents = this.students();
    this.activeStudentNumber.set(
      availableStudents.length > 0 ? availableStudents[0] : null
    );

    // Уникальные дисциплины для выбранного студента
    if (this.activeStudentNumber()) {
      const disciplinesWithResults = [
        ...new Set(
          this.results
            .filter((r) => r.studentId === this.activeStudentNumber())
            .map((r) => r.disciplineName)
        ),
      ];
      this.uniqueDisciplines.set(disciplinesWithResults);
    } else {
      this.uniqueDisciplines.set([]);
    }
  }

  selectStudent(studentNumber: number) {
    this.activeStudentNumber.set(studentNumber);

    // обновляем дисциплины для выбранного студента
    const disciplinesWithResults = [
      ...new Set(
        this.results
          .filter((r) => r.studentId === studentNumber)
          .map((r) => r.disciplineName)
      ),
    ];
    this.uniqueDisciplines.set(disciplinesWithResults);
  }

  getSkillsForDiscipline(discipline: string) {
    const skills = this.studentResults()
      .filter((r) => r.disciplineName === discipline)
      .map((r) => r.skillName);
    return [...new Set(skills)];
  }

  getScore(studentId: number, skillName: string) {
    const res = this.results.find(
      (r) => r.studentId === studentId && r.skillName === skillName
    );
    return res ? res.score : 0;
  }

  private calculateScore(
    stepScores: { stepId: number; score: number }[]
  ): number {
    if (!stepScores?.length) return 0;
    const total = stepScores.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / (stepScores.length * 2)) * 100); // 🔹 считаем в процентах
  }

  getAverageForDiscipline(discipline: string): number {
    const res = this.studentResults().filter(
      (r) => r.disciplineName === discipline
    );
    if (!res.length) return 0;
    const totalPercent = res.reduce((sum, r) => sum + r.score, 0);
    return Math.round(totalPercent / res.length); // 🔹 среднее в процентах
  }
}
