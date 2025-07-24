import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { Skill } from '../../../interfaces/skill.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-skills',
  imports: [CommonModule],
  templateUrl: './all-skills.html',
  styleUrl: './all-skills.css',
})
export class AllSkills {
  skills: Skill[] | undefined;

  constructor(private router: Router, private skillService: SkillService) {}

  ngOnInit() {
    this.skillService.getAllSkills().subscribe((skills: Skill[]) => {
      this.skills = skills;
    });
  }

  goToSkillTest(id: number) {
    this.router.navigate(['/skilltest', id]);
  }
}
