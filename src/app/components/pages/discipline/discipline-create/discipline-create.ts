import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

import { Discipline } from '../../../../interfaces/discipline.interface';
import { Skill } from '../../../../interfaces/skill.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { SkillService } from '../../../../services/skill.service';

@Component({
  selector: 'app-discipline-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './discipline-create.html',
  styleUrls: ['./discipline-create.css'],
})
export class DisciplineCreate implements OnDestroy {
  newDisciplineName = '';
  availableSkillsForDiscipline: Skill[] = [];
  disciplineSkills: Skill[] = [];
  availableDisciplines: Discipline[] = [];

  availableDisciplineListHeight = 0;
  disciplineListHeight = 0;

  private destroy$ = new Subject<void>();

  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;
  @ViewChildren('disciplineSkillRef')
  disciplineSkillElements!: QueryList<ElementRef>;

  constructor(
    private skillService: SkillService,
    private disciplineService: DisciplineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  ngAfterViewInit(): void {
    this.availableSkillElements?.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHeights());
    this.disciplineSkillElements?.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHeights());
    this.updateHeights();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------------- API -----------------
  private loadSkills(): void {
    this.skillService
      .getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (skills) => {
          this.availableSkillsForDiscipline = skills;
          this.updateHeights();
        },
        error: (err) => console.error('Ошибка загрузки навыков:', err),
      });
  }

  saveDiscipline(): void {
    if (!this.newDisciplineName.trim() || this.disciplineSkills.length === 0)
      return;

    const newDiscipline: Discipline = {
      id: -1,
      name: this.newDisciplineName.trim(),
      skills: this.disciplineSkills,
    };
    console.log(newDiscipline);

    this.disciplineService
      .createDiscipline(newDiscipline)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Дисциплина добавлена');
          this.resetForm();
          this.loadSkills();
        },
        error: (err) => console.error('Ошибка при добавлении дисциплины:', err),
      });
  }

  removeDiscipline(id: number): void {
    this.disciplineService
      .deleteDiscipline(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.availableDisciplines = this.availableDisciplines.filter(
            (d) => d.id !== id
          );
          this.updateHeights();
        },
        error: (err) => console.error('Ошибка удаления дисциплины:', err),
      });
  }

  // ----------------- Drag & Drop -----------------
  dropSkill(event: CdkDragDrop<Skill[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateHeights();
  }

  // ----------------- Helpers -----------------
  private updateHeights(): void {
    requestAnimationFrame(() => {
      this.availableDisciplineListHeight = this.calculateTotalHeight(
        this.availableSkillElements
      );
      this.disciplineListHeight = this.calculateTotalHeight(
        this.disciplineSkillElements
      );
      this.cdr.detectChanges();
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    const baseHeight = 80;
    return (
      elements?.reduce(
        (total, el) => total + (el.nativeElement.offsetHeight || 0),
        baseHeight
      ) || baseHeight
    );
  }

  private resetForm(): void {
    this.newDisciplineName = '';
    this.disciplineSkills = [];
  }
}
