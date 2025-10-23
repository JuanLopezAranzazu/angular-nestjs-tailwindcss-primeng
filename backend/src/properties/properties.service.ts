import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../users/types/role.type';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    private usersService: UsersService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    userId: number,
  ): Promise<Property> {
    const user = await this.usersService.findOne(userId);
    const userRole = user.role;

    let ownerId = createPropertyDto.ownerId;

    if (userRole === Role.OWNER) {
      ownerId = userId;
    } else if (userRole === Role.ADMIN) {
      if (!ownerId) {
        ownerId = userId;
      }
      const owner = await this.usersService.findOne(ownerId);
      if (owner.role === Role.USER) {
        throw new BadRequestException(
          'El propietario debe tener rol OWNER o ADMIN',
        );
      }
    }

    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      ownerId,
    });

    return this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.propertiesRepository.find();
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(
        `La propiedad con ID ${id} no fue encontrada`,
      );
    }

    return property;
  }

  async findByOwner(ownerId: number): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { ownerId },
    });
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
    userId: number,
  ): Promise<Property> {
    const property = await this.findOne(id);
    const user = await this.usersService.findOne(userId);
    const userRole = user.role;

    // verificar permisos
    if (userRole === Role.OWNER && property.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo puedes editar tus propias propiedades',
      );
    }

    if (updatePropertyDto.ownerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden cambiar el propietario de la propiedad',
      );
    }

    if (updatePropertyDto.ownerId && userRole === Role.ADMIN) {
      const newOwner = await this.usersService.findOne(
        updatePropertyDto.ownerId,
      );
      if (newOwner.role === Role.USER) {
        throw new BadRequestException(
          'El nuevo propietario debe tener rol OWNER o ADMIN',
        );
      }
    }

    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: number, userId: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    const property = await this.findOne(id);

    // verificar permisos
    if (user.role === Role.OWNER && property.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo puedes eliminar tus propias propiedades',
      );
    }

    await this.propertiesRepository.remove(property);
  }
}
