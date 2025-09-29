import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckExamResult } from './check-exam-result';

describe('CheckExamResult', () => {
  let component: CheckExamResult;
  let fixture: ComponentFixture<CheckExamResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckExamResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckExamResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
