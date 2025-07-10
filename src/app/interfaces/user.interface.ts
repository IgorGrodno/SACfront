import { UserRole } from './userRole.interface';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
}
