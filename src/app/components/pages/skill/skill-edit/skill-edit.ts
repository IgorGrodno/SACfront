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
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Skill } from '../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { SkillService } from '../../../../services/skill.service';
import { StepService } from '../../../../services/step.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-skill-edit',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './skill-edit.html',
  styleUrl: './skill-edit.css',
})
export class SkillEdit implements OnInit, AfterViewInit {
  skill: Skill | undefined;
  newSkillName = '';
  newStepName = '';
  newStepPenalty = false;

  availableSkills: Skill[] = [];
  skills: Skill[] = [];

  availableSteps: SkillStep[] = [];
  skillSteps: SkillStep[] = [];
  filteredSteps: SkillStep[] = [];

  availableListHeight = 0;
  skillListHeight = 0;

  @ViewChildren('availableStepRef')
  availableStepElements!: QueryList<ElementRef>;

  @ViewChildren('skillStepRef')
  skillStepElements!: QueryList<ElementRef>;

  private subs: Subscription[] = [];

  private readonly DEFAULT_MIN_HEIGHT = 120; // fallback, px

  allSteps: SkillStep[] = [];

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private stepService: StepService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const skillIdParam = this.route.snapshot.paramMap.get('id');
    const skillId = skillIdParam !== null ? Number(skillIdParam) : undefined;

    if (typeof skillId === 'number' && !isNaN(skillId)) {
      this.skillService.getSkill(skillId).subscribe({
        next: (skill) => {
          this.skill = skill;
          this.newSkillName = skill.name;
          this.skillSteps = skill.steps || [];
          console.log('Навык загружен:', this.skill);
          this.triggerHeightUpdate();
        },
      });
    }

    const s = this.stepService.getAllSteps().subscribe({
      next: (data) => {
        this.allSteps = data; // сохраняем все шаги
        this.updateAvailableSteps();
        console.log('Все шаги загружены:', this.allSteps);
      },
      error: (err) => console.error('Ошибка загрузки шагов:', err),
    });
    this.subs.push(s);
  }

  private updateAvailableSteps(): void {
    const skillStepIds = new Set(this.skillSteps.map((s) => s.id));
    this.availableSteps = this.allSteps.filter(
      (step) => !skillStepIds.has(step.id)
    );
    this.filterSteps(); // обновляем фильтр
    this.triggerHeightUpdate();
  }

  ngAfterViewInit(): void {
    // Подписываемся один раз на изменения QueryList
    const s1 = this.availableStepElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    const s2 = this.skillStepElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    this.subs.push(s1, s2);

    // Первичное измерение (после того как DOM отрендерит элементы)
    this.triggerHeightUpdate();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private triggerHeightUpdate(): void {
    // Ждём, пока браузер применит layout — requestAnimationFrame работает надёжно
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const availableHeight = this.calculateTotalHeight(
          this.availableStepElements
        );
        const skillHeight = this.calculateTotalHeight(this.skillStepElements);

        // Берём максимальную высоту (минимальный запас DEFAULT_MIN_HEIGHT)
        const maxHeight = Math.max(
          availableHeight,
          skillHeight,
          this.DEFAULT_MIN_HEIGHT
        );
        const minHeight = Math.max(
          Math.round(maxHeight * 0.5),
          this.DEFAULT_MIN_HEIGHT
        );

        // Устанавливаем высоты — минимум 50% от максимальной
        this.ngZone.run(() => {
          this.availableListHeight = Math.max(availableHeight, minHeight);
          this.skillListHeight = Math.max(skillHeight, minHeight);
          this.cdr.detectChanges();
        });
      });
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    if (!elements || elements.length === 0) return 0;

    let total = 0;
    elements.forEach((el) => {
      const native = el.nativeElement as HTMLElement;
      // offsetHeight + внешний margin-bottom (если есть)
      const style = window.getComputedStyle(native);
      const marginBottom = parseFloat(style.marginBottom || '0') || 0;
      total += (native.offsetHeight || 0) + marginBottom;
    });
    return total + 12; // небольшой запас сверху/снизу
  }

  // ---------------- STEPS ----------------

  addStep(): void {
    if (!this.newStepName.trim()) return;

    const step: SkillStep = {
      id: -1,
      name: this.newStepName.trim(),
      canDelete: true,
      mistakePossible: this.newStepPenalty,
    };

    this.stepService.addStep(step).subscribe({
      next: () => {
        this.stepService.getAllSteps().subscribe({
          next: (data) => {
            this.allSteps = data;
            this.updateAvailableSteps(); // пересчитываем доступные шаги
          },
          error: (err) => console.error('Ошибка загрузки шагов:', err),
        });
      },
      error: (err) => console.error('Ошибка добавления шага:', err),
    });

    this.newStepPenalty = false;
    this.newStepName = '';
  }

  removeStep(id: number) {
    this.stepService.removeStep(id).subscribe({
      next: () => {
        this.skillSteps = this.skillSteps.filter((s) => s.id !== id);
        this.updateAvailableSteps();
      },
    });
  }

  drop(event: CdkDragDrop<SkillStep[]>) {
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
    this.updateAvailableSteps(); // пересчитываем доступные шаги после drag&drop
  }

  saveSkill(): void {
    if (!this.newSkillName.trim() || this.skillSteps.length === 0) return;

    const skill: Skill = {
      id: this.skill ? this.skill.id : -1,
      name: this.newSkillName.trim(),
      steps: this.skillSteps,
      canDelete: true,
    };

    this.skillService
      .updateSkill(this.skill ? this.skill.id : -1, skill)
      .subscribe({
        next: () => {
          console.log('Навык обновлён');
          const s = this.stepService.getAllSteps().subscribe({
            next: (data) => {
              this.availableSteps = data;
              this.triggerHeightUpdate();
            },
            error: (err) => console.error('Ошибка загрузки шагов:', err),
          });
          this.subs.push(s);
        },
        error: (err) => console.error('Ошибка при обновлении навыка:', err),
      });
  }

  filterSteps(): void {
    const term = this.newStepName.trim().toLowerCase();

    if (!term) {
      // если пусто — показываем все
      this.filteredSteps = [...this.availableSteps];
      return;
    }

    this.filteredSteps = this.availableSteps.filter((step) =>
      step.name.toLowerCase().includes(term)
    );
  }
}
