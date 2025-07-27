import { SkillStep } from './skillStep.interface';

export interface Skill {
  id: number;
  name: string;
  steps: SkillStep[];
}
