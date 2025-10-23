import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Role } from '../users/types/role.type';
import { JwtPayload } from './types/jwtPayload.type';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    // validar el correo
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // validar la contraseña
    const passwordValid = await argon.verify(user.password, password);
    if (!passwordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    return user;
  }

  async login(user: User) {
    // generar nuevo par de tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);

    // guardar hash del nuevo refresh token
    await this.usersService.updateRt(user.id, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: Role.USER,
    });

    // generar nuevo par de tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    // guardar hash del nuevo refresh token
    await this.usersService.updateRt(user.id, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async logout(userId: number) {
    // eliminar token
    await this.usersService.removeRt(userId);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Acceso denegado');
    }

    const rtMatches = await argon.verify(user.hashedRt, refreshToken);
    if (!rtMatches) throw new ForbiddenException('Token inválido');

    // generar nuevo par de tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);

    // guardar hash del nuevo rt
    await this.usersService.updateRt(user.id, tokens.refresh_token);

    return tokens;
  }

  // generar los tokens
  async getTokens(userId: number, email: string, role: Role) {
    const jwtPayload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
