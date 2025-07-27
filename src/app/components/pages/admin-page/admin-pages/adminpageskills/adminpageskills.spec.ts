import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminpageskills } from './adminpageskills';

describe('Adminpageskills', () => {
  let component: Adminpageskills;
  let fixture: ComponentFixture<Adminpageskills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adminpageskills],
    }).compileComponents();

    fixture = TestBed.createComponent(Adminpageskills);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
