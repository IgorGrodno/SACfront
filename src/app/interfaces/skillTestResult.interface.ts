export interface SkillTestResult {
  skillId: number;
  studentId: number;
  teacherId?: number;
  stepIdScore: { id: number; value: number }[];
  lithMistakes: number;
  hardMistakes: number;
  resultDate: Date;
}
