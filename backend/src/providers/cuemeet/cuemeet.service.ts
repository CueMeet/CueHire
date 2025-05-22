import CueMeetClient from 'cuemeet-client';
import { Injectable } from '@nestjs/common';
import { CUEMEET_BASE_URL } from '../../constants/config';

@Injectable()
export class CueMeetService {
  private cueMeetClient: CueMeetClient;

  constructor() {
    this.cueMeetClient = new CueMeetClient({
      baseUrl: CUEMEET_BASE_URL,
    });
  }

  // User Management
  async createUser(email: string, name: string) {
    const user = await this.cueMeetClient.createUser({
      name,
      email,
    });

    const apiKeyData = await this.cueMeetClient.createApiKey({
      userId: user.id,
      name: `API Key - ${user.email}`,
    });

    return {
      ...user,
      apiKey: apiKeyData.apiKey,
    };
  }

  async createBot(apiKey: string, name: string, meetingUrl: string) {
    try {
      const bot = await this.cueMeetClient.createBot(apiKey, {
        name,
        meetingUrl,
      });

      return bot;
    } catch (error) {
      console.log(error);
    }
  }

  async retrieveBot(apiKey: string, botId: string) {
    const bot = await this.cueMeetClient.retrieveBot(apiKey, botId);

    return bot;
  }

  async removeBot(apiKey: string, botId: string) {
    const bot = await this.cueMeetClient.removeBotFromCall(apiKey, botId);

    return bot;
  }

  async retrieveTranscript(
    apiKey: string,
    botId: string,
    pagination: { page: number; limit: number },
  ) {
    const transcript = await this.cueMeetClient.retrieveTranscript(
      apiKey,
      botId,
      pagination,
    );

    return transcript;
  }
}
