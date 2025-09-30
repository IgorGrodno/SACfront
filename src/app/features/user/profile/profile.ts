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
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  user!: User;

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

  @ViewChild('availableList') availableList?: CdkDropList;
  @ViewChild('userList') userList?: CdkDropList;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private disciplineService: DisciplineService,
    private userService: UserService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ProfilePage ngOnInit');
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');

    this.route.params
      .pipe(
        switchMap((params) => {
          this.userId =
            +params['id'] || this.authService.getCurrentUser()?.id || 0;
          console.log('Resolved userId =', this.userId);

          return forkJoin({
            profile: this.profileService.getProfile(this.userId).pipe(
              catchError((err) => {
                console.error('getProfile error', err);
                return of(undefined as Profile | undefined);
              })
            ),
            user: this.userService.getUserById(this.userId).pipe(
              catchError((err) => {
                console.error('getUserById error', err);
                return of(undefined as User | undefined);
              })
            ),
          });
        }),
        switchMap(({ profile, user }) => {
          this.userProfile = profile;
          if (user) {
            this.user = user;
            this.username = user.username;
          } else {
            // fallback пустой объект, чтобы избежать ошибок
            this.user = {} as User;
          }

          this.firstName = this.userProfile?.firstName ?? '';
          this.secondName = this.userProfile?.secondName ?? '';
          this.fatherName = this.userProfile?.fatherName ?? '';

          // если профиля нет — вернём пустые массивы, чтобы forkJoin не провалился
          if (!this.userProfile?.id) {
            return of({ userDisciplines: [], availableDisciplines: [] });
          }

          return forkJoin({
            userDisciplines: this.disciplineService
              .getUserDisciplines(this.userProfile.id)
              .pipe(
                catchError((err) => {
                  console.error('getUserDisciplines error', err);
                  return of([] as Discipline[]);
                })
              ),
            availableDisciplines: this.disciplineService.getDisciplines().pipe(
              catchError((err) => {
                console.error('getDisciplines error', err);
                return of([] as Discipline[]);
              })
            ),
          });
        })
      )
      .subscribe({
        next: ({ userDisciplines, availableDisciplines }) => {
          this.userDisciplines = userDisciplines || [];
          this.availableDisciplines = (availableDisciplines || []).filter(
            (d) => !this.userDisciplines.some((ud) => ud.id === d.id)
          );

          console.log('userDisciplines', this.userDisciplines);
          console.log('availableDisciplines', this.availableDisciplines);

          // OnPush — явно пометить для проверки
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Ошибка загрузки профиля или дисциплин', err);
        },
      });
  }

  saveProfile(): void {
    if (!this.userProfile) return;

    this.userProfile.firstName = this.firstName.trim();
    this.userProfile.secondName = this.secondName.trim();
    this.userProfile.fatherName = this.fatherName.trim();

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
    console.log('ProfilePage ngAfterViewInit');
    // безопасно инициализируем connectedTo если элементы доступны
    setTimeout(() => {
      if (this.availableList && this.userList) {
        try {
          this.availableList.connectedTo = [this.userList];
          this.userList.connectedTo = [this.availableList];
        } catch (e) {
          console.warn('Ошибка при установке connectedTo', e);
        }
      }

      // подписываемся на изменения QueryList и обновляем высоты
      this.availableSkillElements?.changes.subscribe(() =>
        this.updateHeights()
      );
      this.userSkillElements?.changes.subscribe(() => this.updateHeights());
      this.updateHeights();
    });
  }

  private updateHeights(): void {
    try {
      setTimeout(() => {
        this.availableSkillsListHeight = this.calculateTotalHeight(
          this.availableSkillElements
        );
        this.userSkillsListHeight = this.calculateTotalHeight(
          this.userSkillElements
        );
        this.cdr.detectChanges();
      });
    } catch (e) {
      console.error('updateHeights error', e);
    }
  }

  private calculateTotalHeight(elements?: QueryList<ElementRef>): number {
    const baseHeight = 120;
    if (!elements) return baseHeight;

    const arr = elements.toArray();
    if (arr.length === 0) return baseHeight;

    return arr.reduce(
      (total, el) => total + (el?.nativeElement?.offsetHeight || 0),
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
