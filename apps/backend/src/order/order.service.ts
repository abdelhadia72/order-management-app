import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    try {
      this.logger.debug(
        `Creating order for user ${userId} with items: ${JSON.stringify(createOrderDto.items)}`,
      );

      // Validate product existence and stock
      for (const item of createOrderDto.items) {
        const product = await this.prisma.product.findUnique({
          where: { productId: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Create the order with a default status
      const orderStatus = 'PENDING';

      const order = await this.prisma.order.create({
        data: {
          status: orderStatus,
          user: {
            connect: { userId },
          },
          orderItems: {
            create: createOrderDto.items.map((item) => ({
              quantity: item.quantity,
              product: {
                connect: { productId: item.productId },
              },
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Additional logging for successful order creation
      this.logger.debug(`Order created successfully: ${JSON.stringify(order)}`);

      return order;
    } catch (error) {
      // Detailed error logging
      this.logger.error(`Error creating order: ${error.message}`);
      this.logger.error(error.stack);

      // Re-throw BadRequestExceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle Prisma-specific errors
      if (error.code) {
        this.logger.error(`Prisma error code: ${error.code}`);

        // Foreign key constraint error
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Referenced record not found. Check product IDs.',
          );
        }
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the order. Please try again.',
      );
    }
  }

  async findOne(orderId: number, userId?: number) {
    const whereClause: any = { orderId };

    if (userId !== undefined) {
      whereClause.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (order && userId !== undefined && order.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this order');
    }

    return order;
  }

  async updateStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { orderId },
      data: { status },
    });
  }

  async findAll(userId?: number) {
    try {
      this.logger.debug(
        `Finding orders${userId ? ` for user ${userId}` : ' (all users)'}`,
      );

      const whereClause: any = {};

      if (userId !== undefined) {
        whereClause.userId = userId;
      }

      const orders = await this.prisma.order.findMany({
        where: whereClause,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  productId: true,
                  name: true,
                  price: true,
                  description: true,
                  stock: true,
                },
              },
            },
          },
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      // If no orders found, return an empty array with a message
      if (orders.length === 0) {
        this.logger.debug(
          `No orders found${userId ? ` for user ${userId}` : ''}`,
        );

        // Instead of throwing an exception, return an empty array
        // This is a valid response - the user just doesn't have any orders yet
        return {
          orders: [],
          count: 0,
          message: userId
            ? "You don't have any orders yet. Start shopping to create your first order!"
            : 'No orders found in the system.',
        };
      }

      // Calculate total for each order
      const ordersWithTotals = orders.map((order) => {
        // Calculate the total price for this order
        const total = order.orderItems.reduce((sum, item) => {
          return sum + item.quantity * item.product.price;
        }, 0);

        return {
          ...order,
          total: parseFloat(total.toFixed(2)), // Format to 2 decimal places
        };
      });

      return {
        orders: ordersWithTotals,
        count: ordersWithTotals.length,
        message: `Successfully retrieved ${ordersWithTotals.length} orders.`,
      };
    } catch (error) {
      this.logger.error(`Error retrieving orders: ${error.message}`);
      this.logger.error(error.stack);

      throw new InternalServerErrorException(
        'An error occurred while retrieving orders. Please try again.',
      );
    }
  }
}
