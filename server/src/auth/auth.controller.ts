import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LoginDto, LoginWithCodeDto, ResetPasswordDto, SendCodeDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserRole } from 'src/user/schema/user.schema';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto);
    const tokens = this.authService.login(user);
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
  @Post('send-code')
  async sendVerificationCode(@Body() sendCodeDto: SendCodeDto) {
    await this.authService.generateAndSendVerificationCode(sendCodeDto.email);
    return { message: 'Verification code sent successfully' };
  }

  @Post('forgot-password/send-code')
  async sendForgotPasswordCode(@Body() sendCodeDto: SendCodeDto) {
    await this.authService.generateAndSendVerificationCode(sendCodeDto.email);
    return { message: 'Verification code sent successfully' };
  }

  @Post('forgot-password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password has been reset successfully' };
  }

  @Post('login-with-code')
  async loginWithCode(
    @Body() loginWithCodeDto: LoginWithCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateCodeAndLogin(
      loginWithCodeDto.email,
      loginWithCodeDto.code,
    );
    const tokens = this.authService.login(user);
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

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const tokens = this.authService.refresh(user);
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.phuong-mt.id.vn' : undefined,
      path: '/',
    });

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      path: '/',
      domain: isProd ? '.phuong-mt.id.vn' : undefined,
    });
    res.clearCookie('refreshToken', {
      path: '/',
      domain: isProd ? '.phuong-mt.id.vn' : undefined,
    });
    return { message: 'Logout successful' };
  }
}
