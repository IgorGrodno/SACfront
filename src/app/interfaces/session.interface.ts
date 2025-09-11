export interface Session {
  id?: number;
  name: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  studentNumbers: number[];
}
