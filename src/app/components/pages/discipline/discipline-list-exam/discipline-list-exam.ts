import { Component } from '@angular/core';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/user.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discipline-list-exam',
  imports: [CommonModule],
  templateUrl: './discipline-list-exam.html',
  styleUrl: './discipline-list-exam.css',
})
export class DisciplineListExam {
  disciplineList: Discipline[] = [];
  currentUser: User | null = null;

  constructor(
    private disciplineService: DisciplineService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser) {
        this.disciplineService
          .getUserDisciplines(this.currentUser.id)
          .subscribe((disciplines) => {
            this.disciplineList = disciplines;
          });
      }
    });
  }

  goSkillList(id: number) {
    this.router.navigate(['/skill-list', id]);
  }
}
