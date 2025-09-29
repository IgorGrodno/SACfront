import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplineListExam } from './discipline-list-exam';

describe('DisciplineListExam', () => {
  let component: DisciplineListExam;
  let fixture: ComponentFixture<DisciplineListExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplineListExam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplineListExam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
