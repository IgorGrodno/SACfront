export interface Session {
  id?: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  studentNumbers: number[];
}
