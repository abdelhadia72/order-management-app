import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. User not logged in.' })
  getProfile(@CurrentUser() user) {
    return this.userService.findById(user.userId);
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  async findOne(@Param('userId') userId: string) {
    return this.userService.findById(Number(userId));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new user (admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User successfully created.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Delete(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin access required.',
  })
  async delete(@Param('userId') userId: string) {
    return this.userService.deleteUser(Number(userId));
  }
}
