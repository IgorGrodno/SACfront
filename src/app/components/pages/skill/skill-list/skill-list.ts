import { Component, OnInit } from '@angular/core';
import { Skill } from '../../../../interfaces/skill.interface';
import { CommonModule } from '@angular/common';
import { SkillService } from '../../../../services/skill.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DisciplineService } from '../../../../services/discipline.service';

@Component({
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrls: ['./skill-list.css'],
  imports: [CommonModule],
})
export class SkillList implements OnInit {
  skills: Skill[] = [];
  disciplineId?: string;

  constructor(
    private skillService: SkillService,
    private disciplineService: DisciplineService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.disciplineId = this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.disciplineId) {
      this.skillService
        .getDisciplineSkills(+this.disciplineId)
        .subscribe((skills) => {
          this.skills = skills;
        });
    } else {
      this.skillService.getSkills().subscribe((skills) => {
        this.skills = skills;
      });
    }
  }

  goSkillExam(id: number) {
    this.router.navigate(['/skill-exam', id]);
  }
}
