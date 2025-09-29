import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillCreate } from './skill-create';

describe('SkillCreate', () => {
  let component: SkillCreate;
  let fixture: ComponentFixture<SkillCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
