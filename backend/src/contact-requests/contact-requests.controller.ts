import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { ContactRequestStatus } from './types/contactRequestStatus.type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/users/types/role.type';

@Controller('contact-requests')
@UseGuards(RolesGuard)
export class ContactRequestsController {
  constructor(
    private readonly contactRequestsService: ContactRequestsService,
  ) {}

  @Post()
  create(
    @GetCurrentUserId() userId: number,
    @Body() createContactRequestDto: CreateContactRequestDto,
  ) {
    return this.contactRequestsService.create(createContactRequestDto, userId);
  }

  @Get('my-requests')
  getMyRequests(@GetCurrentUserId() userId: number) {
    return this.contactRequestsService.findByUser(userId);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @Get('property/:propertyId')
  getByProperty(
    @GetCurrentUserId() userId: number,
    @Param('propertyId') propertyId: string,
  ) {
    return this.contactRequestsService.findByProperty(+propertyId, userId);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @Patch('status/:id')
  update(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contactRequestsService.updateStatus(
      +id,
      status as ContactRequestStatus,
      userId,
    );
  }

  @Roles(Role.ADMIN, Role.USER)
  @Delete(':id')
  remove(@GetCurrentUserId() userId: number, @Param('id') id: string) {
    return this.contactRequestsService.remove(+id, userId);
  }
}
