export interface SkillTestResult {
  skillId: number;
  studentId: number;
  teacherId?: number;
  stepScore: { name: string; value: number }[];
  lightMistakes: number;
  hardMistakes: number;
  resultDate: Date;
}
