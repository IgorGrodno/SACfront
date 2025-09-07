import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  QueryList,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../interfaces/profile.interface';
import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, forkJoin } from 'rxjs';
import { DisciplineService } from '../../../services/discipline.service';
import { Discipline } from '../../../interfaces/discipline.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'], // ✅ styleUrls (plural!) – Angular требует массив
})
export class ProfilePage implements OnInit, AfterViewInit {
  @Input() userId!: number;
  userProfile?: Profile;
  isAdmin: boolean = false;

  firstName: string = '';
  secondName: string = '';
  fatherName: string = '';

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
            userDisciplines: this.disciplineService.getUserDisciplines(
              profile.id
            ),
            availableDisciplines: this.disciplineService.getDisciplines(),
          });
        })
      )
      .subscribe(({ userDisciplines, availableDisciplines }) => {
        this.userDisciplines = userDisciplines;
        this.availableDisciplines = availableDisciplines.filter(
          (discipline) => !userDisciplines.some((s) => s.id === discipline.id)
        );
      });
  }

  ngAfterViewInit(): void {
    // ✅ откладываем связывание на следующий tick, чтобы оба списка точно были созданы
    setTimeout(() => {
      if (this.availableList && this.userList) {
        this.availableList.connectedTo = [this.userList];
        this.userList.connectedTo = [this.availableList];
      }

      this.availableSkillElements.changes.subscribe(() =>
        this.triggerHeightUpdate()
      );
      this.userSkillElements.changes.subscribe(() =>
        this.triggerHeightUpdate()
      );
      this.triggerHeightUpdate();
    });
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

  drop(event: CdkDragDrop<Discipline[]>) {
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
      .updateProfile(this.userProfile, this.userDisciplines)
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
