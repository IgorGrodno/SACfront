import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { Discipline } from '../../../interfaces/discipline.interface';
import { Skill } from '../../../interfaces/skill.interface';
import { SkillService } from '../../skill/skill.service';
import { DisciplineService } from '../discipline.service';

@Component({
  selector: 'app-discipline-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './discipline-edit.html',
  styleUrls: ['./discipline-edit.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisciplineEdit implements OnInit, AfterViewInit, OnDestroy {
  discipline?: Discipline;
  newDisciplineName = '';

  allSkills: Skill[] = [];
  availableSkillsForDiscipline: Skill[] = [];
  disciplineSkills: Skill[] = [];

  availableDisciplines: Discipline[] = [];

  availableDisciplineListHeight = 0;
  disciplineListHeight = 0;

  private readonly DEFAULT_MIN_HEIGHT = 120;
  private destroy$ = new Subject<void>();

  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;
  @ViewChildren('disciplineSkillRef')
  disciplineSkillElements!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private disciplineService: DisciplineService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadSkills(() => this.loadDisciplineIfEditing());
  }

  ngAfterViewInit(): void {
    this.availableSkillElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());
    this.disciplineSkillElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerHeightUpdate());
    this.triggerHeightUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------------- API -----------------
  private loadSkills(callback?: () => void): void {
    this.skillService
      .getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (skills) => {
          this.allSkills = skills;
          this.updateAvailableSkills();
          callback?.();
        },
      });
  }

  private loadDisciplineIfEditing(): void {
    const disciplineIdParam = this.route.snapshot.paramMap.get('id');
    const disciplineId = disciplineIdParam
      ? Number(disciplineIdParam)
      : undefined;

    if (disciplineId && !isNaN(disciplineId)) {
      this.disciplineService
        .getDiscipline(disciplineId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (discipline) => {
            this.discipline = discipline;
            this.newDisciplineName = discipline.name;
            this.disciplineSkills = discipline.skills ?? [];
            this.updateAvailableSkills();
            this.triggerHeightUpdate();
          },
        });
    }
  }

  private updateAvailableSkills(): void {
    const selectedIds = new Set(this.disciplineSkills.map((s) => s.id));
    this.availableSkillsForDiscipline = this.allSkills.filter(
      (s) => !selectedIds.has(s.id)
    );
    this.triggerHeightUpdate();
  }

  // ----------------- UI Actions -----------------
  dropSkill(event: CdkDragDrop<Skill[]>): void {
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
    this.updateAvailableSkills();
  }

  saveDiscipline(): void {
    if (!this.newDisciplineName.trim() || this.disciplineSkills.length === 0)
      return;

    const disciplineToSave: Discipline = {
      id: this.discipline?.id ?? -1,
      name: this.newDisciplineName.trim(),
      skills: this.disciplineSkills,
    };

    const save$ = this.discipline?.id
      ? this.disciplineService.updateDiscipline(
          disciplineToSave.id,
          disciplineToSave
        )
      : this.disciplineService.createDiscipline(disciplineToSave);

    save$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadSkills(() => this.loadDisciplineIfEditing()),
    });
  }

  removeDiscipline(id: number): void {
    this.disciplineService
      .deleteDiscipline(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.availableDisciplines = this.availableDisciplines.filter(
            (d) => d.id !== id
          );
          this.triggerHeightUpdate();
        },
      });
  }

  // ----------------- Helpers -----------------
  private triggerHeightUpdate(): void {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const availableHeight = this.calculateTotalHeight(
          this.availableSkillElements
        );
        const disciplineHeight = this.calculateTotalHeight(
          this.disciplineSkillElements
        );

        const maxHeight = Math.max(
          availableHeight,
          disciplineHeight,
          this.DEFAULT_MIN_HEIGHT
        );
        const minHeight = Math.max(
          Math.round(maxHeight * 0.5),
          this.DEFAULT_MIN_HEIGHT
        );

        this.ngZone.run(() => {
          this.availableDisciplineListHeight = Math.max(
            availableHeight,
            minHeight
          );
          this.disciplineListHeight = Math.max(disciplineHeight, minHeight);
          this.cdr.detectChanges();
        });
      });
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    if (!elements?.length) return 0;
    return elements.toArray().reduce((total, el) => {
      const native = el.nativeElement as HTMLElement;
      const margin =
        parseFloat(window.getComputedStyle(native).marginBottom || '0') || 0;
      return total + (native.offsetHeight || 0) + margin;
    }, 12);
  }
}
