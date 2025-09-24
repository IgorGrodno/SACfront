import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  QueryList,
  ViewChild,
  ViewChildren,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { forkJoin, switchMap } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { DisciplineService } from '../../../services/discipline.service';
import { Profile } from '../../../interfaces/profile.interface';
import { Discipline } from '../../../interfaces/discipline.interface';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfilePage implements OnInit, AfterViewInit {
  @Input() userId!: number;
  userProfile?: Profile;
  isAdmin = false;

  username = '';
  newPassword = '';

  firstName = '';
  secondName = '';
  fatherName = '';

  availableDisciplines: Discipline[] = [];
  userDisciplines: Discipline[] = [];

  availableSkillsListHeight = 0;
  userSkillsListHeight = 0;

  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;
  @ViewChildren('userSkillRef') userSkillElements!: QueryList<ElementRef>;

  @ViewChild('availableList') availableList!: CdkDropList;
  @ViewChild('userList') userList!: CdkDropList;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private disciplineService: DisciplineService,
    private userService: UserService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');

    this.route.params
      .pipe(
        switchMap((params) => {
          this.userId =
            +params['id'] || this.authService.getCurrentUser()?.id || 0;
          return forkJoin({
            profile: this.profileService.getProfile(this.userId),
            user: this.userService.getUserById(this.userId),
          });
        }),
        switchMap(({ profile, user }) => {
          this.userProfile = profile;
          this.username = user.username;

          this.firstName = profile.firstName || '';
          this.secondName = profile.secondName || '';
          this.fatherName = profile.fatherName || '';

          return forkJoin({
            userDisciplines: this.disciplineService.getUserDisciplines(
              profile.id
            ),
            availableDisciplines: this.disciplineService.getDisciplines(),
          });
        })
      )
      .subscribe({
        next: ({ userDisciplines, availableDisciplines }) => {
          this.userDisciplines = userDisciplines;
          this.availableDisciplines = availableDisciplines.filter(
            (d) => !userDisciplines.some((ud) => ud.id === d.id)
          );
        },
        error: (err) =>
          console.error('Ошибка загрузки профиля или дисциплин', err),
      });
  }

  saveProfile(): void {
    if (!this.userProfile) return;

    this.userProfile.firstName = this.firstName.trim();
    this.userProfile.secondName = this.secondName.trim();
    this.userProfile.fatherName = this.fatherName.trim();

    const profileRequest = this.profileService.updateProfile(
      this.userProfile,
      this.userDisciplines
    );

    if (this.isAdmin && this.userProfile) {
      // Ensure roles are present for User object
      const user: User = {
        id: this.userId,
        username: this.username.trim(),
        password: this.newPassword.trim() || undefined,
        roles: (this.userProfile as any).roles || [], // fallback if roles are not present
      };

      forkJoin([profileRequest, this.userService.updateUser(user)]).subscribe({
        next: () => {
          console.log('Профиль и пользователь обновлены');
          this.newPassword = '';
        },
        error: (err) => console.error('Ошибка при обновлении профиля', err),
      });
    } else {
      profileRequest.subscribe({
        next: () => {
          console.log('Профиль обновлен');
          this.newPassword = '';
        },
        error: (err) => console.error('Ошибка при обновлении профиля', err),
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.availableList && this.userList) {
        this.availableList.connectedTo = [this.userList];
        this.userList.connectedTo = [this.availableList];
      }

      this.availableSkillElements.changes.subscribe(() => this.updateHeights());
      this.userSkillElements.changes.subscribe(() => this.updateHeights());
      this.updateHeights();
    });
  }

  private updateHeights(): void {
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
    const baseHeight = 120;
    return elements.reduce(
      (total, el) => total + (el.nativeElement.offsetHeight || 0),
      baseHeight
    );
  }

  drop(event: CdkDragDrop<Discipline[]>): void {
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
    this.updateHeights();
  }
}
