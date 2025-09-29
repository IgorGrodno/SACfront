import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
  OnInit,
  ChangeDetectionStrategy,
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

import { AuthService } from '../../../shared/services/auth.service';
import { Discipline } from '../../../interfaces/discipline.interface';
import { Profile } from '../../../interfaces/profile.interface';
import { User } from '../../../interfaces/user.interface';
import { DisciplineService } from '../../discipline/discipline.service';
import { ProfileService } from '../profile.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit, AfterViewInit {
  @Input() userId!: number;
  userProfile?: Profile;
  isAdmin = false;
  user!: User; // теперь будем хранить полный объект пользователя

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
          this.user = user; // сохраняем полный объект пользователя
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

    // обновляем профиль
    this.userProfile.firstName = this.firstName.trim();
    this.userProfile.secondName = this.secondName.trim();
    this.userProfile.fatherName = this.fatherName.trim();

    // обновляем загруженного юзера (меняем только логин/пароль)
    this.user.username = this.username.trim();
    if (this.newPassword.trim()) {
      this.user.password = this.newPassword.trim();
    }

    const profileRequest = this.profileService.updateProfile(
      this.userProfile,
      this.userDisciplines
    );

    if (this.isAdmin) {
      forkJoin([
        profileRequest,
        this.userService.updateUser(this.user),
      ]).subscribe({
        next: () => {
          this.newPassword = '';
          alert('Профиль и пользователь успешно обновлены.');
        },
        error: () => alert('Ошибка при обновлении профиля'),
      });
    } else {
      profileRequest.subscribe({
        next: () => {
          this.newPassword = '';
          alert('Профиль успешно обновлён.');
        },
        error: () => alert('Ошибка при обновлении профиля'),
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
