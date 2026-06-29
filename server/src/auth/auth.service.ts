import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}
    async validateUser(loginDto: LoginDto): Promise<any> {
        const user = await this.userService.findByUsername(loginDto.username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new UnauthorizedException('User is blocked');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            userId: user._id.toString(),
            role: user.role,
        };
    }
        async login(user: any) {
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
}
