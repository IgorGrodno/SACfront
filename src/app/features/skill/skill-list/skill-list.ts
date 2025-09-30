import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillService } from '../skill.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Skill } from '../../../interfaces/skill.interface';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrls: ['./skill-list.css'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillList implements OnInit {
  skills: Skill[] = [];
  disciplineId?: string;
  isAdmin = false;

  constructor(
    private skillService: SkillService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.disciplineId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.loadSkills();
  }

  private loadSkills(): void {
    const skills$ = this.disciplineId
      ? this.skillService.getDisciplineSkills(+this.disciplineId)
      : this.skillService.getSkills();

    skills$.subscribe({
      next: (skills) => (this.skills = skills),
      complete: () => this.cdr.markForCheck(), // уведомляем Angular о необходимости перерисовать
    });
  }

  goSkillEdit(id: number): void {
    const routePath = this.disciplineId
      ? ['/skill-exam', id]
      : ['/skill-edit', id];
    this.router.navigate(routePath);
  }

  removeSkill(id: number): void {
    this.skillService.deleteSkill(id).subscribe({
      next: () => {
        this.skills = this.skills.filter((s) => s.id !== id);
      },
    });
  }
}
