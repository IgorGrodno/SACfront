import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discipline-list.html',
  styleUrl: './discipline-list.css',
})
export class DisciplineList implements OnInit {
  disciplines: Discipline[] = [];

  constructor(
    private disciplineService: DisciplineService,
    private router: Router
  ) {}

  ngOnInit() {
    this.disciplineService.getDisciplines().subscribe({
      next: (data) => (this.disciplines = data),
      error: (err) => console.error('Ошибка загрузки дисциплин:', err),
    });
  }

  goDisciplineEdit(id: number) {
    this.router.navigate(['/discipline-edit', id]);
  }

  removeDiscipline(id: number): void {
    this.disciplineService.deleteDiscipline(id).subscribe({
      next: () => {
        this.disciplines = this.disciplines.filter((d) => d.id !== id);
      },
      error: (err) => console.error('Ошибка удаления дисциплины:', err),
    });
  }
}
