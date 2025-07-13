import { Component, Input, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { Skill } from '../../../interfaces/skill.interface';
import { TestStep } from '../../../interfaces/testStep.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillTestResult } from '../../../interfaces/skillTestResult.interface';
import { StudentService } from '../../../services/student.service';

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
  studentNumbers: number[] = [];
  serchedNumbers: number[] = [];
  studentNumber: number = 0;
  lightMistakes: number = 0;
  hardMistakes: number = 0;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private studentService: StudentService
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
        this.studentService.getStudentNumbers().subscribe({
          next: (numbers: number[]) => {
            this.studentNumbers = numbers;
            this.serchedNumbers = this.studentNumbers;
          },
          error: (err) => {
            console.error('Ошибка при загрузке номеров студентов:', err);
          },
        });
      }
    });
  }

  onSearch(value: string) {
    const search = value.trim();
    if (!value) {
      this.serchedNumbers = this.studentNumbers;
    } else
      this.serchedNumbers = this.studentNumbers.filter((num) =>
        num.toString().includes(search)
      );
  }

  increment(index: number) {
    if (this.testSteps[index].value < 3) {
      this.testSteps[index].value++;
    }
  }

  decrement(index: number) {
    if (this.testSteps[index].value > 0) {
      this.testSteps[index].value--;
    }
  }

  incrementMistakes(index: number) {
    if (index === -1) {
      this.lightMistakes++;
    } else {
      this.hardMistakes++;
    }
  }

  decrementMistakes(index: number) {
    if (index === -1) {
      if (this.lightMistakes > 0) {
        this.lightMistakes--;
      }
    } else {
      if (this.hardMistakes > 0) {
        this.hardMistakes--;
      }
    }
  }

  selectStudent(number: number) {
    this.studentNumber = number;
    const searchInput = document.getElementById(
      'searchInput'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
      this.serchedNumbers = this.studentNumbers;
    }
  }

  submit() {
    if (this.studentNumber > 0) {
      const result: SkillTestResult = {
        skillId: this.skillId,
        studentId: this.studentNumber,
        teacherId: undefined,
        stepIdScore: this.testSteps.map((step) => ({
          id: step.id,
          value: step.value,
        })),
        lithMistakes: this.lightMistakes,
        hardMistakes: this.hardMistakes,
        resultDate: new Date(),
      };
      this.skillService.sendTestResult(result).subscribe((response) => {
        alert('результат записан');
        console.log(response);
        this.studentNumber = 0;
        this.studentService.getStudentNumbers().subscribe({
          next: (numbers: number[]) => {
            this.studentNumbers = numbers;
            this.serchedNumbers = this.studentNumbers;
          },
          error: (err) => {
            console.error('Ошибка при загрузке номеров студентов:', err);
          },
        });
      });
    } else {
      alert('выберите номер студента');
      return;
    }
  }
}
