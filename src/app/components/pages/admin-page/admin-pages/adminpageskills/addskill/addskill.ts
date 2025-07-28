import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SkillService } from '../../../../../../services/skill.service';
import { Skill } from '../../../../../../interfaces/skill.interface';
import { SkillStep } from '../../../../../../interfaces/skillStep.interface';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-addskill',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './addskill.html',
  styleUrl: './addskill.css',
})
export class Addskill implements OnInit {
  @Input() skillId: number | null = null;
  skill: Skill = { id: 0, name: '', steps: [] };
  skillName: string = '';
  allSteps: SkillStep[] = [];
  newStepName: string = '';

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService
  ) {}

  ngOnInit(): void {
    this.loadSkillSteps();
    this.loadSkill();
  }

  private loadSkillSteps(): void {
    this.skillService.getSkillSteps().subscribe({
      next: (steps) => {
        this.allSteps = steps;
        if (this.skillId !== null) {
          const usedIds = this.skill.steps.map((s) => s.id);
          this.allSteps = this.allSteps.filter((s) => !usedIds.includes(s.id));
        }
      },
      error: (err) => console.error('Ошибка при загрузке шагов навыка:', err),
    });
  }

  private loadSkill(): void {
    if (this.skillId === null) return;

    this.skillService.getSkill(this.skillId).subscribe({
      next: (skill) => {
        this.skill = skill;
        this.skillName = skill.name;
        this.loadSkillSteps();
      },
      error: (err) => console.error('Ошибка при загрузке навыка:', err),
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
  }

  saveSkill(): void {
    const payload: Skill = {
      id: this.skillId ?? -1,
      name: this.skillName,
      steps: this.skill.steps,
    };

    if (this.skillId) {
      this.skillService.updateSkill(this.skillId, payload).subscribe({
        next: () => {
          alert('Навык успешно обновлён!');
        },
        error: (err) => {
          console.error('Ошибка при сохранении навыка:', err);
          alert('Ошибка при сохранении навыка');
        },
      });
    } else {
      this.skillService.createSkill(payload).subscribe({
        next: () => {
          alert('Навык успешно создан!');
        },
        error: (err) => {
          console.error('Ошибка при создании навыка:', err);
          alert('Ошибка при создании навыка');
        },
      });
    }
  }

  addNewStep(): void {
    const trimmed = this.newStepName.trim();
    if (!trimmed) return;

    const newStep: SkillStep = { id: -1, description: trimmed };

    this.skillService.addStep(newStep).subscribe({
      next: (step) => {
        this.loadSkillSteps();
        this.newStepName = '';
      },
      error: (err) => console.error('Ошибка при добавлении шага:', err),
    });
  }

  removeStep(stepId: number) {
    const stepToRemove = this.skill.steps.find((s) => s.id === stepId);
    if (!stepToRemove) return;

    this.skill.steps = this.skill.steps.filter((s) => s.id !== stepId);
    this.allSteps.push(stepToRemove);

    this.skillService.removeStep(stepId).subscribe({
      next: () => {
        console.log('Шаг удалён');
      },
      error: (err) => console.error('Ошибка при удалении шага:', err),
    });
  }
}
