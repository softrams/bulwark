export interface User {
  firstName: string;
  lastName: string;
  title: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  newEmail?: string;
  id?: string;
  active?: boolean;
}
