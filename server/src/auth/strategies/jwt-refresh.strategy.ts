/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type UserRole } from 'src/user/schema/user.schema';

interface JwtPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const cookies = request?.cookies as Record<string, string | undefined> | undefined;
          return cookies?.['refreshToken'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') ?? 'defaultSecret',
      passReqToCallback: true,
    });
  }

  validate(
    request: Request,
    payload: JwtPayload,
  ): { userId: string; role: UserRole; refreshToken: string | null } {
    const cookies = request?.cookies as Record<string, string | undefined> | undefined;
    const refreshToken = cookies?.['refreshToken'] ?? null;
    return {
      userId: payload.userId,
      role: payload.role,
      refreshToken,
    };
  }
}
