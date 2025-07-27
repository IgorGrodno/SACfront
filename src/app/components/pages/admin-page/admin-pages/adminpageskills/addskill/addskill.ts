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
    this.skillService.getSkillSteps().subscribe({
      next: (steps) => {
        this.allSteps = steps;
        console.log('All steps fetched:', steps);
      },
      error: (err) => {
        console.error('Ошибка при загрузке шагов навыка:', err);
      },
    });

    if (this.skillId !== null) {
      this.skillService.getSkill(this.skillId).subscribe({
        next: (skill) => {
          this.skill = skill;
          this.skillName = skill.name;
          const usedIds = skill.steps.map((s) => s.id);
          this.allSteps = this.allSteps.filter((s) => !usedIds.includes(s.id));
        },
        error: (err) => {
          console.error('Ошибка при загрузке навыка:', err);
        },
      });
    }
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
      id: this.skillId ?? 0,
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

    const newStep: SkillStep = {
      id: -1,
      description: trimmed,
    };

    console.log('Adding new step:', newStep);

    this.skillService.addStep(newStep).subscribe({
      next: (step) => {
        this.allSteps.push(step);
        this.skill.steps.push(step);
      },
      error: (err) => {
        console.error('Ошибка при добавлении шага:', err);
      },
    });
    this.newStepName = '';
  }
}
