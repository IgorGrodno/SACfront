import { Component } from '@angular/core';
import { Addskill } from './addskill/addskill';
import { Skilllist } from './skilllist/skilllist';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adminpageskills',
  imports: [Skilllist, Addskill, CommonModule],
  templateUrl: './adminpageskills.html',
  styleUrl: './adminpageskills.css',
})
export class Adminpageskills {
  selected: 'skilllist' | 'addskill' = 'skilllist';

  select(view: 'skilllist' | 'addskill') {
    this.selected = view;
  }
}
