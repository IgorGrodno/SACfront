import { UserRole } from './userRole.interface';

export interface User {
  id: number;
  username: string;
  roles: UserRole[];
}
