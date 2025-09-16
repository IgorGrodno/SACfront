import { Component, OnInit } from '@angular/core';
import { Skill } from '../../../../interfaces/skill.interface';
import { CommonModule } from '@angular/common';
import { SkillService } from '../../../../services/skill.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DisciplineService } from '../../../../services/discipline.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrls: ['./skill-list.css'],
  imports: [CommonModule],
})
export class SkillList implements OnInit {
  skills: Skill[] = [];
  disciplineId?: string;
  isAdmin = false;

  constructor(
    private skillService: SkillService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
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
        console.log(this.skills);
      });
    }
  }

  goSkillEdit(id: number) {
    if (this.disciplineId) {
      this.router.navigate(['/skill-exam', id]);
    } else {
      this.router.navigate(['/skill-edit', id]);
    }
  }

  removeSkill(id: number) {
    this.skillService.deleteSkill(id).subscribe({
      next: () => {
        this.skills = this.skills.filter((s) => s.id !== id);
      },
    });
  }
}
