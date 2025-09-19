import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplineEdit } from './discipline-edit';

describe('DisciplineEdit', () => {
  let component: DisciplineEdit;
  let fixture: ComponentFixture<DisciplineEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplineEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplineEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
