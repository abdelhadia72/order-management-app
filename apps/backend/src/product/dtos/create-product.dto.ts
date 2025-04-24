import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Product Name',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @ApiPropertyOptional({
    example: 'Detailed product description',
    description: 'Optional product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100.0, description: 'Product price' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ example: 10, description: 'Available stock quantity' })
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;
}
