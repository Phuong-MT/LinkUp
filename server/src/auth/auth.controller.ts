import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(loginDto);
        const tokens = await this.authService.login(user);
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            domain: isProd ? '.phuong-mt.id.vn' : undefined,
            path: '/',
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            domain: isProd ? '.phuong-mt.id.vn' : undefined,
            path: '/',
        });

        return { message: 'Login successful' };
    }
}
