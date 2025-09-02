import { Skill } from './skill.interface';

export interface Discipline {
  id: number;
  name: string;
  skills?: Skill[];
}
