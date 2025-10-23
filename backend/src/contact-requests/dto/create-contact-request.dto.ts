import { IsString, IsNotEmpty, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;

  @IsInt()
  @Type(() => Number)
  propertyId: number;
}
