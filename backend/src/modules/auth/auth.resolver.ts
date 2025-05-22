import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './output/login.response';
import { Response, Request } from 'express';
import { RefreshTokenResponse } from './output/refresh-token.response';
import { Public } from 'src/decorators/public.decorator';
import { User } from 'src/database/models';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @Mutation(() => LoginResponse)
  async loginWithGoogle(
    @Args('token') token: string,
    @Context('res') res: Response,
  ) {
    return this.authService.loginWithGoogle(token, res);
  }

  @Mutation(() => Boolean)
  async logout(@Context('res') res: Response) {
    await this.authService.logout(res);
    return true;
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Context('req') req: Request & { cookies: { refreshToken?: string } },
    @Context('res') res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    return this.authService.refreshTokens(refreshToken, res);
  }
}
