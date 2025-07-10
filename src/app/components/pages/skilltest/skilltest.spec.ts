import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTest } from './skilltest';

describe('Skilltest', () => {
  let component: SkillTest;
  let fixture: ComponentFixture<SkillTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
