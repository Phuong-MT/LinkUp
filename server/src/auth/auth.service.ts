import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterConfirmDto,
  RegisterSendCodeDto,
  ResetPasswordDto,
  SendCodeDto,
} from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}
  async validateUser(loginDto: LoginDto): Promise<{
    userId: string;
    role: UserRole;
  }> {
    const user = await this.userService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      userId: user._id.toString(),
      role: user.role,
    };
  }
  login(user: { userId: string; role: UserRole }): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.userId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  async generateAndSendVerificationCode(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.userService.saveVerificationCode(user._id.toString(), code, expiresAt);

    // Send the real email
    try {
      await this.mailService.sendVerificationCode(email, code);
    } catch {
      // Clear the code if email fails
      await this.userService.clearVerificationCode(user._id.toString());
      throw new Error('Could not send verification email. Please try again.');
    }
  }

  async validateCodeAndLogin(
    email: string,
    code: string,
  ): Promise<{
    userId: string;
    role: UserRole;
  }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or code');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification code expired');
    }

    // clear code
    await this.userService.clearVerificationCode(user._id.toString());

    return {
      userId: user._id.toString(),
      role: user.role,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or code');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification code expired');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.userService.updatePassword(user._id.toString(), passwordHash);
    await this.userService.clearVerificationCode(user._id.toString());
  }

  async registerSendCode(dto: RegisterSendCodeDto): Promise<void> {
    // Check if username is already taken by an active/blocked user
    const userByUsername = await this.userService.findByUsername(dto.username);
    if (userByUsername && userByUsername.status !== UserStatus.PENDING) {
      throw new BadRequestException('Username is already taken');
    }

    // Check if email is already in use by an active/blocked user
    const userByEmail = await this.userService.findByEmail(dto.email);
    if (userByEmail && userByEmail.status !== UserStatus.PENDING) {
      throw new BadRequestException('Email is already registered');
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Save as a pending user (creates new or updates existing pending)
    const pendingUser = await this.userService.createPendingUser(
      dto.username,
      dto.email,
      passwordHash,
      code,
      expiresAt,
    );

    // Send the email
    try {
      await this.mailService.sendVerificationCode(dto.email, code);
    } catch {
      // Clear the code if email fails
      await this.userService.clearVerificationCode(pendingUser._id.toString());
      throw new Error('Could not send verification email. Please try again.');
    }
  }

  async registerResendCode(dto: SendCodeDto): Promise<void> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.status !== UserStatus.PENDING) {
      throw new BadRequestException('No pending registration found for this email');
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.userService.saveVerificationCode(user._id.toString(), code, expiresAt);

    // Send the email
    try {
      await this.mailService.sendVerificationCode(dto.email, code);
    } catch {
      // Clear the code if email fails
      await this.userService.clearVerificationCode(user._id.toString());
      throw new Error('Could not send verification email. Please try again.');
    }
  }

  async registerConfirm(dto: RegisterConfirmDto): Promise<{ userId: string; role: UserRole }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.status !== UserStatus.PENDING) {
      throw new BadRequestException('Invalid email or registration has not been initiated');
    }

    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification code expired');
    }

    const activatedUser = await this.userService.activateUser(user._id.toString());
    if (!activatedUser) {
      throw new Error('Failed to activate user account');
    }

    return {
      userId: activatedUser._id.toString(),
      role: activatedUser.role,
    };
  }

  refresh(user: { userId: string; role: UserRole }) {
    const payload = {
      userId: user.userId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    return {
      accessToken,
    };
  }
}
