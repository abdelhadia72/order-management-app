import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order (requires authentication)' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request, invalid data or insufficient stock.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. User not logged in.' })
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user) {
    try {
      this.logger.debug(`Order creation requested by user ${user.userId}`);

      if (!createOrderDto.items || createOrderDto.items.length === 0) {
        throw new BadRequestException('Order must contain at least one item');
      }

      return await this.orderService.create(createOrderDto, user.userId);
    } catch (error) {
      this.logger.error(`Error in order creation: ${error.message}`);
      throw error;
    }
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Admin: Get all orders across all users' })
  @ApiResponse({
    status: 200,
    description:
      'Return all orders or empty array with message if no orders exist.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  async findAllAdmin() {
    this.logger.debug('Admin requesting all orders');
    return this.orderService.findAll();
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders placed by the authenticated user' })
  @ApiResponse({
    status: 200,
    description:
      'Return all orders or empty array with message if user has no orders.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. User not logged in.' })
  async findAll(@CurrentUser() user) {
    this.logger.debug(`User ${user.userId} requesting their orders`);
    return this.orderService.findAll(user.userId);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order by ID (checks ownership or admin role)' })
  @ApiParam({ name: 'orderId', required: true, description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Return order details.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or Forbidden.' })
  async findOne(@Param('orderId') orderId: string, @CurrentUser() user) {
    const id = Number(orderId);
    this.logger.debug(
      `Finding order ${id} for user ${user.userId} (role: ${user.role})`,
    );

    let order;

    if (user.role === 'admin') {
      order = await this.orderService.findOne(id);
    } else {
      order = await this.orderService.findOne(id, user.userId);
    }

    if (!order) {
      throw new NotFoundException(
        'Order not found or you do not have permission to view it',
      );
    }

    const total = order.orderItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    return {
      ...order,
      total: parseFloat(total.toFixed(2)),
    };
  }
}
