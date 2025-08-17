import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../interfaces/profile.interface';
import { Skill } from '../../../interfaces/skill.interface';
import { SkillService } from '../../../services/skill.service';
import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  @Input() userId!: number;
  userProfile?: Profile;

  firstName: string = '';
  secondName: string = '';
  fatherName: string = '';

  availableSkills: Skill[] = [];
  userSkills: Skill[] = [];

  availableSkillsListHeight = 0;
  userSkillsListHeight = 0;

  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;
  @ViewChildren('userSkillRef')
  userSkillElements!: QueryList<ElementRef>;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private skillService: SkillService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.userId =
            (+params['id'] || this.authService.getCurrentUser()?.id) ?? 0;
          return this.profileService.getProfile(this.userId);
        }),
        switchMap((profile) => {
          this.userProfile = profile;

          this.firstName = profile.firstName || '';
          this.secondName = profile.secondName || '';
          this.fatherName = profile.fatherName || '';
          return forkJoin({
            userSkills: this.skillService.getUserSkills(profile.id),
            availableSkills: this.skillService.getSkills(),
          });
        })
      )
      .subscribe(({ userSkills, availableSkills }) => {
        this.userSkills = userSkills;
        this.availableSkills = availableSkills.filter(
          (skill) => !userSkills.some((s) => s.id === skill.id)
        );
      });
  }

  ngAfterViewInit(): void {
    this.availableSkillElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    this.userSkillElements.changes.subscribe(() => this.triggerHeightUpdate());
    this.triggerHeightUpdate();
  }

  private triggerHeightUpdate(): void {
    setTimeout(() => {
      this.availableSkillsListHeight = this.calculateTotalHeight(
        this.availableSkillElements
      );
      this.userSkillsListHeight = this.calculateTotalHeight(
        this.userSkillElements
      );
      this.cdr.detectChanges();
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    let total = 120;
    elements.forEach((el) => {
      total += el.nativeElement.offsetHeight || 0;
    });
    return total;
  }

  drop(event: CdkDragDrop<Skill[]>) {
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
    this.triggerHeightUpdate();
  }

  saveProfile() {
    if (!this.userProfile) return;
    this.userProfile.firstName = this.firstName.trim();
    this.userProfile.secondName = this.secondName.trim();
    this.userProfile.fatherName = this.fatherName.trim();

    this.profileService
      .updateProfile(this.userProfile, this.userSkills)
      .subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
          console.log('Профиль успешно обновлён', updatedProfile);
        },
        error: (err) => {
          console.error('Ошибка при обновлении профиля', err);
        },
      });
  }
}
