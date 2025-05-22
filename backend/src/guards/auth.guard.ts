import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthService } from '../providers/jwt/jwt.service';
import { User } from '../database/models';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const accessToken = req.headers.authorization?.split(' ')?.[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const decodedAccessToken =
        await this.jwtAuthService.verifyAccessToken(accessToken);

      if (!decodedAccessToken) {
        throw new UnauthorizedException('Unauthorized');
      }

      const user = await User.findByPk(decodedAccessToken.sub);

      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }

      req.user = user.dataValues;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
