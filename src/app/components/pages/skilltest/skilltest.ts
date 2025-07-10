import { Component, Input, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { Skill } from '../../../interfaces/skill.interface';
import { TestStep } from '../../../interfaces/testStep.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillTestResult } from '../../../interfaces/skillTestResult.interface';

@Component({
  selector: 'app-skilltest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skilltest.html',
  styleUrl: './skilltest.css',
})
export class SkillTest {
  skillId!: number;
  testSteps: { id: number; description: string; value: number }[] = [];
  skill: Skill | undefined;
  numbers: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  studentNumber: number = 0;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      if (idStr) {
        this.skillId = +idStr;
        this.skillService.getSkill(this.skillId).subscribe({
          next: (skill: Skill) => {
            this.skill = skill;
          },
        });
        this.skillService.getSkillTestSteps(this.skillId).subscribe({
          next: (steps: TestStep[]) => {
            steps.forEach((step, index) => {
              this.testSteps.push({
                id: step.id,
                description: step.description,
                value: 0,
              });
            });
          },
          error: (err) => {
            console.error('Ошибка при загрузке тестовых шагов:', err);
          },
        });
      }
    });
  }

  increment(index: number) {
    if (this.testSteps[index].value < 5) {
      this.testSteps[index].value++;
    }
  }

  decrement(index: number) {
    if (this.testSteps[index].value > 0) {
      this.testSteps[index].value--;
    }
  }

  submit() {
    if (this.studentNumber > 1) {
      const result: SkillTestResult = {
        skillId: this.skillId,
        studentId: this.studentNumber,
        teacherId: undefined,
        stepIdScore: this.testSteps.map((step) => ({
          id: step.id,
          value: step.value,
        })),
        resultDate: new Date(),
      };
      this.skillService.sendTestResult(result).subscribe((response) => {
        alert('результат записан');
        console.log(response);
        this.testSteps.forEach((step) => (step.value = 0));
        this.studentNumber = 0;
      });
    } else {
      alert('выберите номер студента');
      return;
    }
  }
}
