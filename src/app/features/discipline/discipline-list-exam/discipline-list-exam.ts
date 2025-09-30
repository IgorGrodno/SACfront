import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Discipline } from '../../../interfaces/discipline.interface';
import { User } from '../../../interfaces/user.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { DisciplineService } from '../discipline.service';
@Component({
  selector: 'app-discipline-list-exam',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discipline-list-exam.html',
  styleUrls: ['./discipline-list-exam.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // исправлено
})
export class DisciplineListExam implements OnInit {
  disciplineList: Discipline[] = [];
  currentUser: User | null = null;

  constructor(
    private disciplineService: DisciplineService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser) {
          this.loadUserDisciplines(this.currentUser.id);
        }
      },
    });
  }

  private loadUserDisciplines(userId: number): void {
    this.disciplineService.getUserDisciplines(userId).subscribe({
      next: (disciplines) => (this.disciplineList = disciplines),
      complete: () => this.cdr.markForCheck(), // уведомляем Angular о необходимости перерисовать
    });
  }

  goSkillList(disciplineId: number): void {
    this.router.navigate(['/skill-list', disciplineId]);
  }
}
