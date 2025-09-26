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
import { Skill } from '../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { SkillService } from '../../../../services/skill.service';
import { StepService } from '../../../../services/step.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-skill-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './skill-edit.html',
  styleUrls: ['./skill-edit.css'],
})
export class SkillEdit implements OnInit, AfterViewInit, OnDestroy {
  skill?: Skill;
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
    private route: ActivatedRoute,
    private skillService: SkillService,
    private stepService: StepService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadSkill();
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

  // -------- API --------
  private loadSkill(): void {
    const skillIdParam = this.route.snapshot.paramMap.get('id');
    const skillId = skillIdParam ? Number(skillIdParam) : undefined;

    if (typeof skillId === 'number' && !isNaN(skillId)) {
      this.skillService
        .getSkill(skillId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (skill) => {
            this.skill = skill;
            this.newSkillName = skill.name;
            this.skillSteps = skill.steps ?? [];
            this.triggerHeightUpdate();
          },
        });
    }
  }

  private loadSteps(): void {
    this.stepService
      .getAllSteps()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allSteps = data;
          this.updateAvailableSteps();
        },
      });
  }

  private updateAvailableSteps(): void {
    const skillStepIds = new Set(this.skillSteps.map((s) => s.id));
    this.availableSteps = this.allSteps.filter((s) => !skillStepIds.has(s.id));
    this.filterSteps();
    this.triggerHeightUpdate();
  }

  // -------- UI / ACTIONS --------
  addStep(): void {
    if (!this.newStepName.trim()) return;

    const step: SkillStep = {
      id: -1,
      name: this.newStepName.trim(),
      canDelete: true,
      mistakePossible: this.newStepPenalty,
    };

    this.newStepName = '';
    this.newStepPenalty = false;

    this.stepService
      .addStep(step)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadSteps(),
      });
  }

  removeStep(id: number): void {
    this.stepService
      .removeStep(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.skillSteps = this.skillSteps.filter((s) => s.id !== id);
          this.updateAvailableSteps();
        },
      });
  }

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

  saveSkill(): void {
    if (!this.newSkillName.trim() || this.skillSteps.length === 0) return;

    const skill: Skill = {
      id: this.skill?.id ?? -1,
      name: this.newSkillName.trim(),
      steps: this.skillSteps,
      canDelete: true,
    };

    this.skillService
      .updateSkill(skill.id, skill)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Навык обновлён');
          this.loadSteps();
        },
      });
  }

  filterSteps(): void {
    const term = this.newStepName.trim().toLowerCase();
    this.filteredSteps = term
      ? this.availableSteps.filter((s) => s.name.toLowerCase().includes(term))
      : [...this.availableSteps];
  }

  // -------- UI Helpers --------
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
