export interface TestResultView {
  id: number;
  sessionName: string;
  skillName: string;
  disciplineName: string;
  studentId: number;
  score: number;
  resultDate: Date;
}

export interface SkillView {
  name: string;
  avg: number;
}

export interface DisciplineView {
  name: string;
  avg: number;
  skills: SkillView[];
}

export interface StudentView {
  id: number;
  avg: number;
  scores: Record<string, number | null>;
}
