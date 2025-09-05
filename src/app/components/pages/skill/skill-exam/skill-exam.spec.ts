import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillExam } from './skill-exam';

describe('SkillExam', () => {
  let component: SkillExam;
  let fixture: ComponentFixture<SkillExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillExam],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillExam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
