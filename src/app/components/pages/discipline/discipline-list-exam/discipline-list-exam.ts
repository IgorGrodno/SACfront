import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { User } from '../../../../interfaces/user.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-discipline-list-exam',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discipline-list-exam.html',
  styleUrls: ['./discipline-list-exam.css'], // исправлено
})
export class DisciplineListExam implements OnInit {
  disciplineList: Discipline[] = [];
  currentUser: User | null = null;

  constructor(
    private disciplineService: DisciplineService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser) {
          this.loadUserDisciplines(this.currentUser.id);
        }
      },
      error: (err) => console.error('Ошибка получения пользователя:', err),
    });
  }

  private loadUserDisciplines(userId: number): void {
    this.disciplineService.getUserDisciplines(userId).subscribe({
      next: (disciplines) => (this.disciplineList = disciplines),
      error: (err) =>
        console.error('Ошибка загрузки дисциплин пользователя:', err),
    });
  }

  goSkillList(disciplineId: number): void {
    this.router.navigate(['/skill-list', disciplineId]);
  }
}
