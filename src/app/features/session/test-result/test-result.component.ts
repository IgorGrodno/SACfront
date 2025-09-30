import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TestResultFacade } from './test-result.facade';
import { TestResultView } from './test-result.model';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface SkillView {
  name: string;
  avg: number;
}

interface DisciplineView {
  name: string;
  avg: number;
  skills: SkillView[];
}

interface StudentView {
  id: number;
  avg: number;
  scores: Record<string, number | null>;
}

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestResultComponent implements OnInit {
  results$!: Observable<TestResultView[]>;
  uniqueDisciplines$!: Observable<DisciplineView[]>;
  filteredStudents$!: Observable<StudentView[]>;
  isLoading$!: Observable<boolean>;

  // локальный диапазон фильтра
  private currentRange = {
    from: null as number | null,
    to: null as number | null,
  };

  constructor(private facade: TestResultFacade) {}

  ngOnInit() {
    this.results$ = this.facade.results$;
    this.uniqueDisciplines$ = this.facade.uniqueDisciplines$;
    this.filteredStudents$ = this.facade.filteredStudents$;
    this.isLoading$ = this.facade.isLoading$;

    this.facade.loadResults();
  }

  onFromChange(value: number | null) {
    this.currentRange.from = value;
    this.facade.setStudentRange(this.currentRange);
  }

  onToChange(value: number | null) {
    this.currentRange.to = value;
    this.facade.setStudentRange(this.currentRange);
  }

  exportToExcel(results: TestResultView[]) {
    this.facade.exportToExcel(results).subscribe({
      next: () => console.log('Excel экспортирован'),
      error: (err) => console.error('Ошибка при экспорте Excel:', err),
    });
  }
}
