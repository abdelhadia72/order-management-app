import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Create product (requires authentication)' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. User not logged in or lacks sufficient permissions.',
  })
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user) {
    return this.productService.create(createProductDto, user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Admin: Get all products across all users' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  findAllAdmin() {
    return this.productService.findAll();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products created by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all products created by the user.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. User not logged in.' })
  findAll(@CurrentUser() user) {
    return this.productService.findAll(user.userId);
  }

  @Get(':productId')
  @ApiOperation({
    summary: 'Get product by ID (checks ownership or admin role)',
  })
  @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Return product details.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or Forbidden.' })
  async findOne(@Param('productId') productId: string, @CurrentUser() user) {
    const id = Number(productId);
    let product;

    if (user.role === 'admin') {
      product = await this.productService.findOne(id);
    } else {
      product = await this.productService.findOne(id, user.userId);
    }

    if (!product) {
      throw new NotFoundException(
        'Product not found or you do not have permission to view it',
      );
    }
    return product;
  }
}
