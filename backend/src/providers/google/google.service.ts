import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GOOGLE_AUTH_CONFIG } from '../../constants/config';
import { calendar_v3, google } from 'googleapis';
import { User } from 'src/database/models';

interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  id_token: string;
  expiry_date: number;
}

interface MeetingDetails {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  candidateName: string;
  candidateEmail: string;
  timezone: string;
}

@Injectable()
export class GoogleService {
  private readonly MAX_RETRIES = 3;

  constructor() {}

  private getOAuth2Client() {
    return new google.auth.OAuth2(
      GOOGLE_AUTH_CONFIG.clientId,
      GOOGLE_AUTH_CONFIG.clientSecret,
      GOOGLE_AUTH_CONFIG.redirectUri,
    );
  }

  async getUserInfo(
    code: string,
  ): Promise<{ userInfo: GoogleUserPayload; tokens: GoogleTokens }> {
    try {
      // Exchange the authorization code for tokens
      const { tokens } = await this.getOAuth2Client().getToken(code);

      if (!tokens || !tokens.access_token) {
        throw new Error('Invalid Google account!');
      }

      // Create a new oauth2 client with explicit auth
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials(tokens);

      // Get user info using the OAuth2 client with explicit auth
      const oauth2 = google.oauth2({
        version: 'v2',
        auth: oauth2Client,
      });

      const response = await oauth2.userinfo.get();
      const data = response.data;

      if (!data.email || !data.name) {
        throw new Error('Invalid Google account!');
      }

      const userInfo: GoogleUserPayload = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        email_verified: data.verified_email || false,
        sub: data.id!,
      };

      return {
        userInfo,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope!,
          id_token: tokens.id_token!,
          expiry_date: tokens.expiry_date!,
        },
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Invalid Google account!');
    }
  }

  private async handleTokenRefresh(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    try {
      const userAuth = this.getOAuth2Client();
      userAuth.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await userAuth.refreshAccessToken();

      await User.update(
        { googleAccessToken: credentials.access_token },
        { where: { id: userId } },
      );

      return credentials.access_token;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  private getCalendar(tokens: {
    accessToken: string;
    refreshToken: string;
  }): calendar_v3.Calendar {
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new BadRequestException('Invalid Google Calendar tokens');
    }

    const userAuth = this.getOAuth2Client();
    userAuth.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: userAuth });
  }

  public async getCalendarUserTokens(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new BadRequestException('Invalid authorization code');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new BadRequestException('Failed to obtain tokens');
    }
  }

  public async getUserCalendarTimezone(accessToken: string): Promise<string> {
    try {
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({
        version: 'v3',
        auth: oauth2Client,
      });

      const response = await calendar.settings.get({
        setting: 'timezone',
      });

      return response.data.value || 'UTC';
    } catch (error) {
      console.error('Failed to get calendar timezone:', error);
      return 'UTC'; // Fallback to UTC if we can't get the timezone
    }
  }

  private async executeWithTokenRefresh<T>(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    operation: (accessToken: string) => Promise<T>,
    retryCount = 0,
  ): Promise<T> {
    try {
      const accessToken = await this.handleTokenRefresh(
        userId,
        tokens.refreshToken,
      );
      return await operation(accessToken);
    } catch (error) {
      if (error.status === 401 && retryCount < this.MAX_RETRIES) {
        return this.executeWithTokenRefresh(
          userId,
          tokens,
          operation,
          retryCount + 1,
        );
      }
      throw error;
    }
  }

  public async createMeetingEvent(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    meetingDetails: MeetingDetails,
  ) {
    return this.executeWithTokenRefresh(userId, tokens, async (accessToken) => {
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: `Interview with ${meetingDetails.candidateName} for ${meetingDetails.title}`,
        location: 'Google Meet',
        description: `Interview for ${meetingDetails.candidateName} for the position of ${meetingDetails.title}`,
        start: {
          dateTime: meetingDetails.startTime,
          timeZone: meetingDetails.timezone,
        },
        end: {
          dateTime: meetingDetails.endTime,
          timeZone: meetingDetails.timezone,
        },
        attendees: [
          ...meetingDetails.attendees.map((attendee) => ({
            email: attendee,
          })),
          { email: meetingDetails.candidateEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1 * 30 },
            { method: 'popup', minutes: 1 * 15 },
          ],
        },
      };

      const result = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendNotifications: true,
        sendUpdates: 'all',
      });

      return result.data;
    });
  }

  public async updateMeetingEvent(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    eventId: string,
    updatedDetails: MeetingDetails,
  ) {
    return this.executeWithTokenRefresh(userId, tokens, async (accessToken) => {
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      const updatedEvent = {
        ...existingEvent.data,
        summary: updatedDetails.title || existingEvent.data.summary,
        description:
          updatedDetails.description || existingEvent.data.description,
        start: updatedDetails.startTime
          ? {
              dateTime: updatedDetails.startTime,
              timeZone:
                updatedDetails.timezone || existingEvent.data.start.timeZone,
            }
          : existingEvent.data.start,
        end: updatedDetails.endTime
          ? {
              dateTime: updatedDetails.endTime,
              timeZone:
                updatedDetails.timezone || existingEvent.data.end.timeZone,
            }
          : existingEvent.data.end,
        attendees:
          updatedDetails.attendees !== undefined &&
          updatedDetails.attendees !== null
            ? [
                ...updatedDetails.attendees.map((email) => ({ email: email })),
                { email: updatedDetails.candidateEmail },
              ]
            : existingEvent.data.attendees,
      };

      const result = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updatedEvent,
        sendUpdates: 'all',
      });

      return result.data;
    });
  }

  public async deleteMeetingEvent(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
    eventId: string,
  ) {
    return this.executeWithTokenRefresh(userId, tokens, async (accessToken) => {
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      return { success: true, message: 'Event deleted successfully' };
    });
  }
}
