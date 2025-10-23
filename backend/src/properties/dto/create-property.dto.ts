import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../types/propertyType.type';
import { PropertyStatus } from '../types/propertyStatus.type';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  type: PropertyType;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  bedrooms: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  bathrooms: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  areaSqm: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  ownerId?: number;
}
