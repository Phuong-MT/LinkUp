import {
  Controller,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { type UserDocument, UserRole } from './schema/user.schema';
import { type Request } from 'express';

@Controller('user')
export class UserController {
  private logger = new Logger(UserController.name);
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  async getProfile(@Req() req: Partial<Request & { user?: { userId: string; role: UserRole } }>) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new NotFoundException('User not found in token');
    }
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userObj = (user.toObject ? user.toObject() : user) as UserDocument;
    return {
      user: {
        id: userObj._id,
        email: userObj.email,
        name: userObj.username,
      },
      role: req.user?.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(
    @Req() req: Partial<Request & { user?: { userId: string; role: UserRole } }>,
    @Query('q') query?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }
    const q = query || '';
    if (!q.trim()) {
      return [];
    }
    const users = await this.userService.searchFriends(userId, q);
    return users.map((u) => {
      const userObj = (u.toObject ? u.toObject() : u) as UserDocument;
      return {
        id: userObj._id,
        username: userObj.username,
        fullName: userObj.profile?.fullName || userObj.username,
        avatar: userObj.profile?.avatar || 'https://i.pravatar.cc/150',
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend/:friendId')
  async addFriend(
    @Req() req: Partial<Request & { user?: { userId: string; role: UserRole } }>,
    @Param('friendId') friendId: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new NotFoundException('User ID not found in token');
    }
    await this.userService.addFriend(userId, friendId);
    return { success: true };
  }
}
