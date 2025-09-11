import { StepScoreEntry } from './stepScoreEntry.interface';

export interface SkillTestResult {
  id?: number;
  sessionId: number;
  skillId: number;
  studentId: number;
  teacherId: number;
  stepScores: StepScoreEntry[];
  resultDate: string;
}
