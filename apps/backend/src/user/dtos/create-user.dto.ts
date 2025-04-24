import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  // Not exposing role in the DTO for security reasons
  // Roles are assigned by the system, not by user input during registration
}
