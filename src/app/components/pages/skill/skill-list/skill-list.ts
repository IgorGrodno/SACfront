import { Component, Input, OnInit } from '@angular/core';
import { Skill } from '../../../../interfaces/skill.interface';
import { CommonModule } from '@angular/common';
import { SkillService } from '../../../../services/skill.service';

@Component({
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrls: ['./skill-list.css'],
  imports: [CommonModule],
})
export class SkillList implements OnInit {
  skills: Skill[] = [];

  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.skillService.getSkills().subscribe((skills) => {
      this.skills = skills;
    });
  }
}
