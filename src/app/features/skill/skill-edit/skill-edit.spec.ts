import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillEdit } from './skill-edit';

describe('SkillEdit', () => {
  let component: SkillEdit;
  let fixture: ComponentFixture<SkillEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
