import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserService } from '../user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and return JWT token' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and logged in.',
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiConflictResponse({ description: 'Email already in use.' })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      // First create the user
      const user = await this.userService.create(createUserDto);

      // Then automatically login the user by generating a JWT token
      const loginDto: LoginDto = {
        email: createUserDto.email,
        password: createUserDto.password,
      };

      // Use the authentication service to generate the token
      return this.authService.login(loginDto);
    } catch (error) {
      // Re-throw exceptions from UserService
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // For other unexpected errors
      throw new BadRequestException({
        status: 400,
        message: 'Registration failed. Please try again.',
        error: 'Bad Request',
      });
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
