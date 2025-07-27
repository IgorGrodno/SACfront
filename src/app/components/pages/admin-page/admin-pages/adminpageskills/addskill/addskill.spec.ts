import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addskill } from './addskill';

describe('Addskill', () => {
  let component: Addskill;
  let fixture: ComponentFixture<Addskill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addskill],
    }).compileComponents();

    fixture = TestBed.createComponent(Addskill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
