import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Discipline } from '../../../../interfaces/discipline.interface';
import { Skill } from '../../../../interfaces/skill.interface';
import { DisciplineService } from '../../../../services/discipline.service';
import { SkillService } from '../../../../services/skill.service';

@Component({
  selector: 'app-discipline-create',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './discipline-create.html',
  styleUrl: './discipline-create.css',
})
export class DisciplineCreate {
  constructor(
    private skillService: SkillService,
    private cdr: ChangeDetectorRef,
    private disciplineService: DisciplineService
  ) {}

  newDisciplineName = '';

  // Списки для перетаскивания
  availableSkillsForDiscipline: Skill[] = [];
  disciplineSkills: Skill[] = [];

  // Все дисциплины
  availableDisciplines: Discipline[] = [];

  // refs для подсчёта высоты
  @ViewChildren('availableSkillRef')
  availableSkillElements!: QueryList<ElementRef>;

  @ViewChildren('disciplineSkillRef')
  disciplineSkillElements!: QueryList<ElementRef>;

  availableDisciplineListHeight = 0;
  disciplineListHeight = 0;

  ngOnInit(): void {
    this.skillService.getSkills().subscribe({
      next: (data) => {
        this.availableSkillsForDiscipline = data;
        this.triggerHeightUpdate();
      },
      error: (err) => console.error('Ошибка загрузки навыков:', err),
    });

    this.disciplineService.getDisciplines().subscribe({
      next: (data) => {
        this.availableDisciplines = data;
        this.triggerHeightUpdate();
      },
      error: (err) => console.error('Ошибка загрузки дисциплин:', err),
    });
  }

  ngAfterViewInit(): void {
    this.availableSkillElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    this.disciplineSkillElements.changes.subscribe(() =>
      this.triggerHeightUpdate()
    );
    this.triggerHeightUpdate();
  }

  dropSkill(event: CdkDragDrop<Skill[]>) {
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

  saveDiscipline(): void {
    if (!this.newDisciplineName.trim() || this.disciplineSkills.length === 0)
      return;

    const discipline: Discipline = {
      id: 0,
      name: this.newDisciplineName.trim(),
      skills: this.disciplineSkills,
    };

    this.disciplineService.createDiscipline(discipline).subscribe({
      next: () => {
        console.log('Дисциплина добавлена');
        this.newDisciplineName = '';
        this.disciplineSkills = [];

        // обновляем списки
        this.skillService.getSkills().subscribe({
          next: (data) => {
            this.availableSkillsForDiscipline = data;
            this.triggerHeightUpdate();
          },
          error: (err) => console.error('Ошибка загрузки навыков:', err),
        });

        this.disciplineService.getDisciplines().subscribe({
          next: (data) => {
            this.availableDisciplines = data;
            this.triggerHeightUpdate();
          },
          error: (err) => console.error('Ошибка загрузки дисциплин:', err),
        });
      },
      error: (err) => console.error('Ошибка при добавлении дисциплины:', err),
    });
  }

  removeDiscipline(id: number): void {
    this.disciplineService.deleteDiscipline(id).subscribe({
      next: () => {
        this.availableDisciplines = this.availableDisciplines.filter(
          (d) => d.id !== id
        );
        this.triggerHeightUpdate();
      },
      error: (err) => console.error('Ошибка удаления дисциплины:', err),
    });
  }

  private triggerHeightUpdate(): void {
    setTimeout(() => {
      this.availableDisciplineListHeight = this.calculateTotalHeight(
        this.availableSkillElements
      );
      this.disciplineListHeight = this.calculateTotalHeight(
        this.disciplineSkillElements
      );
      this.cdr.detectChanges();
    });
  }

  private calculateTotalHeight(elements: QueryList<ElementRef>): number {
    let total = 80;
    elements.forEach((el) => {
      total += el.nativeElement.offsetHeight || 0;
    });
    return total;
  }
}
