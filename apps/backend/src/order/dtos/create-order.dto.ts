import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';

// DTO for OrderItem in an Order
export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsInt()
  @IsPositive()
  quantity: number;
}

// Main DTO for creating an Order
export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'Array of order items (products and quantities)',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
