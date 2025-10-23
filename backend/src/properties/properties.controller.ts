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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/users/types/role.type';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('properties')
@UseGuards(RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(Role.ADMIN, Role.OWNER)
  @Post()
  create(
    @GetCurrentUserId() userId: number,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(createPropertyDto, userId);
  }

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @Get('owner/my-properties')
  getMyProperties(@GetCurrentUserId() userId: number) {
    return this.propertiesService.findByOwner(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(':id')
  update(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(+id, updatePropertyDto, userId);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @Delete(':id')
  remove(@GetCurrentUserId() userId: number, @Param('id') id: string) {
    return this.propertiesService.remove(+id, userId);
  }
}
