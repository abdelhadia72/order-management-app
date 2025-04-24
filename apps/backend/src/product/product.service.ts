import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    try {
      this.logger.debug(
        `Creating product for user ${userId}: ${JSON.stringify(createProductDto)}`,
      );

      return this.prisma.product.create({
        data: {
          ...createProductDto,
          userId,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`);
      this.logger.error(error.stack);

      throw new BadRequestException(
        'Failed to create product. Please check your input and try again.',
      );
    }
  }

  async findOne(productId: number, userId?: number) {
    const whereClause: any = { productId };

    if (userId !== undefined) {
      whereClause.userId = userId;
    }

    const product = await this.prisma.product.findFirst({
      where: whereClause,
    });

    return product;
  }

  async findAll(userId?: number) {
    if (userId) {
      return this.prisma.product.findMany({
        where: { userId },
      });
    }

    return this.prisma.product.findMany();
  }
}
