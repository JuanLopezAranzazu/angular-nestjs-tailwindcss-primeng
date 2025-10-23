import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactRequest } from './entities/contact-request.entity';
import { Repository } from 'typeorm';
import { PropertiesService } from 'src/properties/properties.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/types/role.type';
import { ContactRequestStatus } from './types/contactRequestStatus.type';

@Injectable()
export class ContactRequestsService {
  constructor(
    @InjectRepository(ContactRequest)
    private contactRequeststRepository: Repository<ContactRequest>,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
  ) {}

  async create(
    createContactRequestDto: CreateContactRequestDto,
    userId: number,
  ): Promise<ContactRequest> {
    await this.propertiesService.findOne(createContactRequestDto.propertyId);
    await this.usersService.findOne(userId);

    const contactRequest = this.contactRequeststRepository.create({
      ...createContactRequestDto,
      userId,
    });

    return this.contactRequeststRepository.save(contactRequest);
  }

  async findOne(id: number): Promise<ContactRequest> {
    const contactRequest = await this.contactRequeststRepository.findOne({
      where: { id },
    });

    if (!contactRequest) {
      throw new NotFoundException(
        `La solicitud con ID ${id} no fue encontrada`,
      );
    }

    return contactRequest;
  }

  async findByUser(userId: number): Promise<ContactRequest[]> {
    return this.contactRequeststRepository.find({
      where: { userId },
    });
  }

  async findByProperty(
    propertyId: number,
    userId: number,
  ): Promise<ContactRequest[]> {
    const property = await this.propertiesService.findOne(propertyId);
    const user = await this.usersService.findOne(userId);

    if (user.role !== Role.ADMIN && property.ownerId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para ver estas solicitudes',
      );
    }

    return this.contactRequeststRepository.find({
      where: { propertyId },
    });
  }

  async updateStatus(
    id: number,
    status: ContactRequestStatus,
    userId: number,
  ): Promise<ContactRequest> {
    const user = await this.usersService.findOne(userId);
    const contactRequest = await this.findOne(id);
    const property = await this.propertiesService.findOne(
      contactRequest.propertyId,
    );

    // verificar permisos
    if (
      user.role !== Role.ADMIN &&
      !(user.role === Role.OWNER && property.ownerId === userId)
    ) {
      throw new ForbiddenException(
        'Solo administradores o el dueño de la propiedad pueden actualizar el estado',
      );
    }

    contactRequest.status = status;
    return this.contactRequeststRepository.save(contactRequest);
  }

  async remove(id: number, userId: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    const contactRequest = await this.findOne(id);

    // verificar permisos
    if (user.role === Role.USER && contactRequest.userId !== userId) {
      throw new ForbiddenException(
        'Solo puedes eliminar tus propias solicitudes',
      );
    }

    await this.contactRequeststRepository.remove(contactRequest);
  }
}
