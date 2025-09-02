import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplineCreate } from './discipline-create';

describe('DisciplineCreate', () => {
  let component: DisciplineCreate;
  let fixture: ComponentFixture<DisciplineCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplineCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplineCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
