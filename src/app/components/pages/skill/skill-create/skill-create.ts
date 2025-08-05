import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Skill } from '../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../interfaces/skillStep.interface';
import { SkillService } from '../../../../services/skill.service';
import { StepService } from '../../../../services/step.service';

@Component({
  selector: 'app-skill-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './skill-create.html',
  styleUrls: ['./skill-create.css'],
})
export class SkillCreate implements OnInit {
  skillName = '';
  newStepName = '';

  availableSteps: SkillStep[] = [];
  skillSteps: SkillStep[] = [];

  constructor(
    private skillService: SkillService,
    private stepService: StepService
  ) {}

  ngOnInit(): void {
    this.stepService.getAllSteps().subscribe({
      next: (data) => (this.availableSteps = data),
      complete: () => this.updateListHeights(),
      error: (err) => console.error('Ошибка загрузки шагов:', err),
    });
  }

  availableListHeight = 0;
  skillListHeight = 0;

  @ViewChild('availableListContainer')
  availableListRef!: ElementRef<HTMLDivElement>;
  @ViewChild('skillListContainer') skillListRef!: ElementRef<HTMLDivElement>;

  addStep(): void {
    if (!this.newStepName.trim()) return;
    const step: SkillStep = {
      id: -1,
      name: this.newStepName.trim(),
      canDelete: true,
    };
    this.stepService.addStep(step).subscribe({
      next: (data) => {
        this.availableSteps.push(data);
      },
    });
    this.newStepName = '';
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
    setTimeout(() => this.updateListHeights(), 0);
  }

  updateListHeights() {
    const STEP_HEIGHT = 40; // или реальное значение

    this.availableListHeight = this.availableSteps.length * STEP_HEIGHT + 20;
    this.skillListHeight = this.skillSteps.length * STEP_HEIGHT + 20;
  }
  saveSkill(): void {
    if (!this.skillName.trim() || this.skillSteps.length === 0) return;
    const skill: Skill = {
      id: 0, // сервер установит
      name: this.skillName.trim(),
      steps: this.skillSteps,
    };
    this.skillService.createSkill(skill).subscribe({
      next: () => {
        console.log('Навык добавлен');
        this.skillName = '';
        this.skillSteps = [];
        this.stepService.getAllSteps().subscribe({
          next: (data) => (this.availableSteps = data),
          complete: () => this.updateListHeights(),
          error: (err) => console.error('Ошибка загрузки шагов:', err),
        });
      },
      error: (err) => console.error('Ошибка при добавлении навыка:', err),
    });
  }
}
