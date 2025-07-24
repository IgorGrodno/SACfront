import { Skill } from './skill.interface';

export interface SkillsPage {
  notes: Skill[];
  toalNotes: number;
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  teatherId?: number;
}
