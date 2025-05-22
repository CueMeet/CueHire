import { Injectable } from '@nestjs/common';
import { GoogleService } from '../../providers/google/google.service';
import { User } from 'src/database/models';
import { JwtAuthService } from '../../providers/jwt/jwt.service';
import { Response } from 'express';
import { IS_PRODUCTION } from 'src/constants/config';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class AuthService {
  constructor(
    private googleService: GoogleService,
    private jwtService: JwtAuthService,
    private organizationService: OrganizationService,
  ) {}

  async loginWithGoogle(token: string, res: Response) {
    try {
      const { userInfo, tokens } = await this.googleService.getUserInfo(token);

      let user = await User.findOne({
        where: { email: userInfo.email.toLowerCase() },
      });

      let organization = null;

      if (!user) {
        user = await User.create({
          email: userInfo.email.toLowerCase(),
          name: userInfo.name,
          avatar: userInfo.picture || null,
          sub: userInfo.sub,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: new Date(tokens.expiry_date),
        });

        // Get user's timezone from Google Calendar
        const timezone = await this.googleService.getUserCalendarTimezone(
          tokens.access_token,
        );

        // Create organization for new user
        organization = await this.organizationService.createOrganizationForUser(
          user,
          timezone,
        );
      } else {
        await user.update({
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: new Date(tokens.expiry_date),
          avatar: userInfo.picture || null,
        });

        // Get user's organization and update timezone if needed
        organization = await this.organizationService.getOrganizationByUserId(
          user.id,
        );

        if (organization && organization.timezone === 'UTC') {
          const timezone = await this.googleService.getUserCalendarTimezone(
            tokens.access_token,
          );
          await organization.update({ timezone });
        }
      }

      const { accessToken, refreshToken } =
        await this.jwtService.generateTokens(user.id, user.email);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || '',
        },
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
              isDemo: organization.isDemo,
            }
          : null,
      };
    } catch (error) {
      console.error('Error in loginWithGoogle:', error);
      throw error;
    }
  }

  async logout(res: Response) {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    });

    return { success: true };
  }

  async refreshTokens(refreshToken: string, res: Response) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.jwtService.generateTokens(payload.sub, payload.email);

    // Update refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }
}
