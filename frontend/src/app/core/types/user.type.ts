import { Role } from "./role.type";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}
