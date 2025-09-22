import {
  Component,
  ElementRef,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Skill } from '../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { SkillService } from '../../../../services/skill.service';
import { StepService } from '../../../../services/step.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-skill-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './skill-create.html',
  styleUrls: ['./skill-create.css'],
})
export class SkillCreate implements OnInit, AfterViewInit, OnDestroy {
  newSkillName = '';
  newStepName = '';
  newStepPenalty = false;

  availableSteps: SkillStep[] = [];
  skillSteps: SkillStep[] = [];
  filteredSteps: SkillStep[] = [];

  availableListHeight = 0;
  skillListHeight = 0;

  allSteps: SkillStep[] = [];

  private readonly DEFAULT_MIN_HEIGHT = 120;
  private destroy$ = new Subject<void>();

  @ViewChildren('availableStepRef')
  availableStepElements!: QueryList<ElementRef>;
  @ViewChildren('skillStepRef') skillStepElements!: QueryList<ElementRef>;

  constructor(
    private skillService: SkillService,
    private stepService: StepService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadSteps();
  }

  ngAfterViewInit(): void {
    this.availableStepElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());

    this.skillStepElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());

    this.triggerHeightUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------------- API -----------------
  private loadSteps(): void {
    this.stepService
      .getAllSteps()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allSteps = data;
          this.updateAvailableSteps();
        },
        error: (err) => console.error('Ошибка загрузки шагов:', err),
      });
  }

  addStep(): void {
    if (!this.newStepName.trim()) return;

    const step: SkillStep = {
      id: -1,
      name: this.newStepName.trim(),
      canDelete: true,
      mistakePossible: this.newStepPenalty,
    };

    this.stepService
      .addStep(step)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newStepPenalty = false;
          this.newStepName = '';
          this.loadSteps();
        },
        error: (err) => console.error('Ошибка добавления шага:', err),
      });
  }

  removeStep(id: number): void {
    this.stepService
      .removeStep(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allSteps = this.allSteps.filter((s) => s.id !== id);
          this.updateAvailableSteps();
        },
        error: (err) => console.error('Ошибка удаления шага:', err),
      });
  }

  saveSkill(): void {
    if (!this.newSkillName.trim() || this.skillSteps.length === 0) return;

    const skill: Skill = {
      id: 0,
      name: this.newSkillName.trim(),
      steps: this.skillSteps,
      canDelete: true,
    };

    this.skillService
      .createSkill(skill)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Навык добавлен');
          this.newSkillName = '';
          this.skillSteps = [];
          this.loadSteps();
        },
        error: (err) => console.error('Ошибка при добавлении навыка:', err),
      });
  }

  // ----------------- UI -----------------
  drop(event: CdkDragDrop<SkillStep[]>): void {
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
    this.updateAvailableSteps();
  }

  filterSteps(): void {
    const term = this.newStepName.trim().toLowerCase();
    this.filteredSteps = term
      ? this.availableSteps.filter((step) =>
          step.name.toLowerCase().includes(term)
        )
      : [...this.availableSteps];
  }

  private updateAvailableSteps(): void {
    const skillStepIds = new Set(this.skillSteps.map((s) => s.id));
    this.availableSteps = this.allSteps.filter((s) => !skillStepIds.has(s.id));
    this.filterSteps();
    this.triggerHeightUpdate();
  }

  private triggerHeightUpdate(): void {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const availableHeight = this.calculateTotalHeight(
          this.availableStepElements
        );
        const skillHeight = this.calculateTotalHeight(this.skillStepElements);

        const maxHeight = Math.max(
          availableHeight,
          skillHeight,
          this.DEFAULT_MIN_HEIGHT
        );
        const minHeight = Math.max(
          Math.round(maxHeight * 0.5),
          this.DEFAULT_MIN_HEIGHT
        );

        this.ngZone.run(() => {
          this.availableListHeight = Math.max(availableHeight, minHeight);
          this.skillListHeight = Math.max(skillHeight, minHeight);
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
