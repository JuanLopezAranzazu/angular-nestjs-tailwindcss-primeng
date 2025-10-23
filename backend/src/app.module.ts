import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { PropertiesModule } from './properties/properties.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),
    // conexion a la db
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    // modulo de usuarios
    UsersModule,
    // modulo para autenticacion de usuarios
    AuthModule,
    // modulo de propiedades
    PropertiesModule,
    // inicializar datos
    DatabaseModule,
  ],
  controllers: [],
  providers: [
    // autenticacion con jwt
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
