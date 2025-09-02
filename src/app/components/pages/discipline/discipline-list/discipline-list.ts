import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { DisciplineService } from '../../../../services/discipline.service';

@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discipline-list.html',
  styleUrl: './discipline-list.css',
})
export class DisciplineList implements OnInit {
  disciplines: Discipline[] = [];
  loading = true;
  error: string | null = null;

  constructor(private disciplineService: DisciplineService) {}

  ngOnInit(): void {
    this.loadDisciplines();
  }

  loadDisciplines(): void {
    this.loading = true;
    this.error = null;

    this.disciplineService.getDisciplines().subscribe({
      next: (data) => {
        this.disciplines = data;
        this.loading = false;
        console.log(this.disciplines);
      },
      error: (err) => {
        console.error('Ошибка загрузки дисциплин:', err);
        this.error = 'Не удалось загрузить дисциплины';
        this.loading = false;
      },
    });
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
