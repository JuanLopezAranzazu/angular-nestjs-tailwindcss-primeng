import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/types/role.type';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      // obtener las variables de entorno necesarias
      const adminEmail = this.config.get<string>('ADMIN_EMAIL');
      const adminPassword = this.config.get<string>('ADMIN_PASSWORD');
      const adminFirstName = this.config.get<string>('ADMIN_FIRST_NAME');
      const adminLastName = this.config.get<string>('ADMIN_LAST_NAME');

      // verificar que todas las variables de entorno estén presentes
      if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
        this.logger.error(
          'Faltan variables de entorno para crear el administrador por defecto. ',
        );
        return;
      }

      // verificar si ya existe un usuario con ese email
      const existingAdmin = await this.usersRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        this.logger.log('El administrador por defecto ya existe.');
        return;
      }

      const hashedPassword = await argon.hash(adminPassword);

      // crear el nuevo usuario administrador
      const admin = this.usersRepository.create({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      });

      await this.usersRepository.save(admin);
      this.logger.log('Administrador por defecto creado correctamente.');
    } catch (error) {
      this.logger.error(
        'Error al crear el administrador por defecto:',
        error.message,
      );
    }
  }
}
