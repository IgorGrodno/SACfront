import { Component } from '@angular/core';
import { SkillService } from '../../../../../../services/skill.service';
import { Skill } from '../../../../../../interfaces/skill.interface';
import { CommonModule } from '@angular/common';
import { Addskill } from '../addskill/addskill';

@Component({
  selector: 'app-skilllist',
  imports: [CommonModule, Addskill],
  templateUrl: './skilllist.html',
  styleUrl: './skilllist.css',
})
export class Skilllist {
  skills: Skill[] = [];
  selected: string = '';
  selectedSkillId: number | null = null;

  constructor(private skillService: SkillService) {
    skillService.getAllSkills().subscribe({
      next: (skills) => {
        if (skills && skills.length > 0) {
          this.skills = skills;
        }
      },
      error: (err) => {
        console.error('Ошибка загрузки навыков:', err);
      },
    });
  }

  deleteSkill(arg0: number) {}

  navigateToSkillDetails(skillId: number): void {
    this.selected = 'addskill';
    this.selectedSkillId = skillId;
  }
}
