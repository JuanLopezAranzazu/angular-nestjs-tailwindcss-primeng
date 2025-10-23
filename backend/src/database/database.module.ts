import { Module } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
