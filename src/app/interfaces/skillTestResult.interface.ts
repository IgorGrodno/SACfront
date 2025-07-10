export interface SkillTestResult {
  skillId: number;
  studentId: number;
  teacherId?: number;
  stepIdScore: { id: number; value: number }[];
  resultDate: Date;
}
