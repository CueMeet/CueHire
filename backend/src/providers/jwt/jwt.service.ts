import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import {
  JWT_ACCESS_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from '../../constants/config';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: JWT_ACCESS_SECRET,
          expiresIn: JWT_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: JWT_REFRESH_SECRET,
          expiresIn: JWT_REFRESH_EXPIRES_IN,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: JWT_ACCESS_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: JWT_REFRESH_SECRET,
    });
  }
}
