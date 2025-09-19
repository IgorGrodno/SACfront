import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Skill } from '../../../../interfaces/skill.interface';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { SkillService } from '../../../../services/skill.service';
import { DisciplineService } from '../../../../services/discipline.service';

@Component({
  selector: 'app-discipline-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './discipline-edit.html',
  styleUrls: ['./discipline-edit.css'],
})
export class DisciplineEdit implements OnInit, AfterViewInit, OnDestroy {
  discipline?: Discipline;
  newDisciplineName = '';

  allSkills: Skill[] = [];
  availableSkillsForDiscipline: Skill[] = [];
  disciplineSkills: Skill[] = [];

  availableDisciplines: Discipline[] = [];

  availableDisciplineListHeight = 0;
  disciplineListHeight = 0;

  private readonly DEFAULT_MIN_HEIGHT = 120;
  private destroy$ = new Subject<void>();

  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;

  @ViewChildren('disciplineSkillRef')
  disciplineSkillElements!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private disciplineService: DisciplineService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  ngAfterViewInit(): void {
    this.availableSkillElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());

    this.disciplineSkillElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());

    this.triggerHeightUpdate(); // сразу после рендера
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // 1. Загружаем все навыки
    this.loadSkills(() => {
      // 2. После загрузки навыков — если редактируем дисциплину, подгружаем её
      this.loadDisciplineIfEditing();
    });
  }

  private loadSkills(callback?: () => void): void {
    this.skillService
      .getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allSkills = data;
          this.updateAvailableSkills(); // пока дисциплина не загружена, сюда попадут все навыки
          callback?.(); // если есть коллбек, вызываем
        },
        error: (err) => console.error('Ошибка загрузки навыков:', err),
      });
  }

  private loadDisciplineIfEditing(): void {
    const disciplineIdParam = this.route.snapshot.paramMap.get('id');
    const disciplineId = disciplineIdParam
      ? Number(disciplineIdParam)
      : undefined;

    if (typeof disciplineId === 'number' && !isNaN(disciplineId)) {
      this.disciplineService
        .getDiscipline(disciplineId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (discipline) => {
            this.discipline = discipline;
            this.newDisciplineName = discipline.name; // имя в input
            this.disciplineSkills = discipline.skills ?? []; // выбранные навыки
            this.updateAvailableSkills(); // пересобираем доступные навыки
            this.triggerHeightUpdate();
          },
          error: (err) => console.error('Ошибка загрузки дисциплины:', err),
        });
    }
  }

  private updateAvailableSkills(): void {
    const selectedSkillIds = new Set(this.disciplineSkills.map((s) => s.id));
    this.availableSkillsForDiscipline = this.allSkills.filter(
      (s) => !selectedSkillIds.has(s.id)
    );
    this.triggerHeightUpdate();
  }

  // -------- UI / ACTIONS --------

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
    this.updateAvailableSkills();
  }

  saveDiscipline(): void {
    if (!this.newDisciplineName.trim() || this.disciplineSkills.length === 0) {
      return;
    }

    const newDiscipline: Discipline = {
      id: this.discipline?.id ?? -1,
      name: this.newDisciplineName.trim(),
      skills: this.disciplineSkills,
    };

    const save$ = this.discipline?.id
      ? this.disciplineService.updateDiscipline(newDiscipline.id, newDiscipline)
      : this.disciplineService.createDiscipline(newDiscipline);

    save$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log('Дисциплина сохранена');
        this.loadSkills(() => this.loadDisciplineIfEditing());
      },
      error: (err) => console.error('Ошибка при сохранении дисциплины:', err),
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

  // -------- UI Helpers --------

  private triggerHeightUpdate(): void {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const availableHeight = this.calculateTotalHeight(
          this.availableSkillElements
        );
        const disciplineHeight = this.calculateTotalHeight(
          this.disciplineSkillElements
        );

        const maxHeight = Math.max(
          availableHeight,
          disciplineHeight,
          this.DEFAULT_MIN_HEIGHT
        );
        const minHeight = Math.max(
          Math.round(maxHeight * 0.5),
          this.DEFAULT_MIN_HEIGHT
        );

        this.ngZone.run(() => {
          this.availableDisciplineListHeight = Math.max(
            availableHeight,
            minHeight
          );
          this.disciplineListHeight = Math.max(disciplineHeight, minHeight);
          this.cdr.detectChanges();
        });
      });
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    if (!elements?.length) return 0;
    return elements.toArray().reduce((total, el) => {
      const native = el.nativeElement as HTMLElement;
      const style = window.getComputedStyle(native);
      const marginBottom = parseFloat(style.marginBottom || '0') || 0;
      return total + (native.offsetHeight || 0) + marginBottom;
    }, 12);
  }
}
