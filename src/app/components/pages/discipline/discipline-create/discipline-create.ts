import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { Skill } from '../../../../interfaces/skill.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { SkillService } from '../../../../services/skill.service';

@Component({
  selector: 'app-discipline-create',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './discipline-create.html',
  styleUrls: ['./discipline-create.css'],
})
export class DisciplineCreate implements OnDestroy {
  constructor(
    private skillService: SkillService,
    private cdr: ChangeDetectorRef,
    private disciplineService: DisciplineService
  ) {}

  private destroy$ = new Subject<void>();

  newDisciplineName = '';

  // списки для drag&drop
  availableSkillsForDiscipline: Skill[] = [];
  disciplineSkills: Skill[] = [];

  // дисциплины
  availableDisciplines: Discipline[] = [];

  // refs для подсчёта высоты
  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;

  @ViewChildren('disciplineSkillRef')
  disciplineSkillElements!: QueryList<ElementRef>;

  availableDisciplineListHeight = 0;
  disciplineListHeight = 0;

  ngOnInit(): void {
    this.skillService
      .getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.availableSkillsForDiscipline = data;
          this.triggerHeightUpdate();
        },
        error: (err) => console.error('Ошибка загрузки навыков:', err),
      });
  }

  ngAfterViewInit(): void {
    this.availableSkillElements?.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());

    this.disciplineSkillElements?.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());
    this.triggerHeightUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dropSkill(event: CdkDragDrop<Skill[]>) {
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
    this.triggerHeightUpdate();
  }

  saveDiscipline(): void {
    if (!this.newDisciplineName.trim() || this.disciplineSkills.length === 0) {
      return;
    }

    const newDiscipline: Discipline = {
      id: -1, // пусть бэк выставит id
      name: this.newDisciplineName.trim(),
      skills: this.disciplineSkills,
    };
    console.log(newDiscipline);

    this.disciplineService
      .createDiscipline(newDiscipline)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          console.log('Дисциплина добавлена');
          this.newDisciplineName = '';
          this.disciplineSkills = [];
          this.skillService
            .getSkills()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data) => {
                this.availableSkillsForDiscipline = data;
                this.triggerHeightUpdate();
              },
              error: (err) => console.error('Ошибка загрузки навыков:', err),
            });
          this.triggerHeightUpdate();
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
          this.triggerHeightUpdate();
        },
        error: (err) => console.error('Ошибка удаления дисциплины:', err),
      });
  }

  private triggerHeightUpdate(): void {
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
    const base = 80; // вынес в константу
    let total = base;
    elements.forEach((el) => {
      total += el.nativeElement.offsetHeight || 0;
    });
    return total;
  }
}
