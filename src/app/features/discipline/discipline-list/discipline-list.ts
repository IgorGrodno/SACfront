import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Discipline } from '../../../interfaces/discipline.interface';
import { DisciplineService } from '../discipline.service';
@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discipline-list.html',
  styleUrls: ['./discipline-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // исправлено с styleUrl
})
export class DisciplineList implements OnInit {
  disciplines: Discipline[] = [];

  constructor(
    private disciplineService: DisciplineService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDisciplines();
  }

  private loadDisciplines(): void {
    this.disciplineService.getDisciplines().subscribe({
      next: (data) => {
        this.disciplines = data;
        this.cdr.markForCheck(); // уведомляем Angular о необходимости перерисовать
      },
    });
  }

  goDisciplineEdit(id: number): void {
    this.router.navigate(['/discipline-edit', id]);
  }

  removeDiscipline(id: number): void {
    this.disciplineService.deleteDiscipline(id).subscribe({
      next: () => {
        this.disciplines = this.disciplines.filter((d) => d.id !== id);
      },
    });
  }
}
