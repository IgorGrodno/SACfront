import {
  Component,
  ElementRef,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
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
import { DisciplineService } from '../../../../services/discipline.service';

@Component({
  selector: 'app-skill-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './skill-create.html',
  styleUrls: ['./skill-create.css'],
})
export class SkillCreate implements OnInit, AfterViewInit {
  newskillName = '';
  newStepName = '';
  newStepPenalty = false;

  availableSkills: Skill[] = [];
  skills: Skill[] = [];

  availableSteps: SkillStep[] = [];
  skillSteps: SkillStep[] = [];

  availableListHeight = 0;
  skillListHeight = 0;

  @ViewChildren('availableStepRef')
  availableStepElements!: QueryList<ElementRef>;

  @ViewChildren('skillStepRef')
  skillStepElements!: QueryList<ElementRef>;

  constructor(
    private skillService: SkillService,
    private stepService: StepService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stepService.getAllSteps().subscribe({
      next: (data) => {
        this.availableSteps = data;
        this.triggerHeightUpdate();
        console.log('Доступные шаги загружены:', this.availableSteps);
      },
      error: (err) => console.error('Ошибка загрузки шагов:', err),
    });
  }

  ngAfterViewInit(): void {
    this.availableStepElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    this.skillStepElements.changes.subscribe(() => this.triggerHeightUpdate());

    this.triggerHeightUpdate();
  }

  private triggerHeightUpdate(): void {
    setTimeout(() => {
      const availableHeight = this.calculateTotalHeight(
        this.availableStepElements
      );
      const skillHeight = this.calculateTotalHeight(this.skillStepElements);

      const maxHeight = Math.max(availableHeight, skillHeight);

      this.availableListHeight = maxHeight;
      this.skillListHeight = maxHeight;

      this.cdr.detectChanges();
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    let total = 80;
    elements.forEach((el) => {
      total += el.nativeElement.offsetHeight || 0;
    });
    return total + 40;
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
            const skillStepIds = new Set(
              this.skillSteps.map((step) => step.id)
            );
            this.availableSteps = data.filter(
              (step) => !skillStepIds.has(step.id)
            );
            this.triggerHeightUpdate();
          },
          error: (err) => console.error('Ошибка загрузки шагов:', err),
        });
      },
      error: (err) => console.error('Ошибка добавления шага:', err),
    });

    this.newStepName = '';
  }

  removeStep(id: number) {
    this.stepService.removeStep(id).subscribe({
      next: () => {
        this.availableSteps = this.availableSteps.filter((s) => s.id !== id);
        this.triggerHeightUpdate();
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
    this.triggerHeightUpdate();
  }

  saveSkill(): void {
    if (!this.newskillName.trim() || this.skillSteps.length === 0) return;

    const skill: Skill = {
      id: 0,
      name: this.newskillName.trim(),
      steps: this.skillSteps,
      canDelete: true,
    };

    this.skillService.createSkill(skill).subscribe({
      next: () => {
        console.log('Навык добавлен');
        this.newskillName = '';
        this.skillSteps = [];

        this.stepService.getAllSteps().subscribe({
          next: (data) => {
            this.availableSteps = data;
            this.triggerHeightUpdate();
          },
          error: (err) => console.error('Ошибка загрузки шагов:', err),
        });
      },
      error: (err) => console.error('Ошибка при добавлении навыка:', err),
    });
  }
}
