import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplineList } from './discipline-list';

describe('DisciplineList', () => {
  let component: DisciplineList;
  let fixture: ComponentFixture<DisciplineList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplineList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplineList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
