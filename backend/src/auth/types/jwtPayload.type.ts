import { Role } from '../../users/types/role.type';

export type JwtPayload = {
  email: string;
  sub: number;
  role: Role;
};
