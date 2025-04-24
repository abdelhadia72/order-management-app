import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException({
          status: 409,
          message: `User with email '${email}' already exists. Please use a different email or login with your existing account.`,
          error: 'Conflict',
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      return this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          role: 'user',
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException({
          status: 409,
          message: `User with email '${email}' already exists. Please use a different email or login with your existing account.`,
          error: 'Conflict',
        });
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadRequestException({
        status: 400,
        message:
          'Failed to create user. Please check your input and try again.',
        error: 'Bad Request',
      });
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        name: true,
        address: true,
        role: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        name: true,
        address: true,
        role: true,
        password: false,
      },
    });
  }

  async deleteUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.prisma.user.delete({
        where: { userId },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      throw new BadRequestException({
        status: 400,
        message: 'Failed to delete user. Please try again.',
        error: 'Bad Request',
      });
    }
  }
}
