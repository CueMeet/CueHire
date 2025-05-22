import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Op } from 'sequelize';
import { CueMeetService } from 'src/providers/cuemeet/cuemeet.service';
import { Meeting } from '../database/models/meeting.model';
import {
  ExecutionLog,
  ExecutionLogEnum,
} from '../database/models/execution-log.model';
import { User } from '../database/models/user.model';
import {
  Organization,
  OrganizationMember,
} from '../database/models/organization.model';
import { MeetingStatusEnum } from '../utils/enums';
import {
  TRANSCRIPT_PROCESSING_QUEUE,
  TRANSCRIPT_PROCESSING_JOB,
} from '../constants/bull-queue';

@Injectable()
export class CalendarEventsScheduler {
  constructor(
    private readonly cueMeetService: CueMeetService,
    @InjectQueue(TRANSCRIPT_PROCESSING_QUEUE)
    private readonly transcriptQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async initializeMeetingBots() {
    console.log('Running periodic meeting bot initialization...');

    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      // Get meetings scheduled in the next 10 minutes
      const upcomingMeetings = await Meeting.findAll({
        where: {
          startTime: {
            [Op.between]: [now.toISOString(), tenMinutesFromNow.toISOString()],
          },
          status: MeetingStatusEnum.CREATED,
          isRecordingEnabled: true,
        },
        include: [
          {
            model: User,
            required: true,
            include: [
              {
                model: OrganizationMember,
                required: true,
                include: [
                  {
                    model: Organization,
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      console.log(
        `Found ${upcomingMeetings.length} upcoming meetings to initialize bots`,
      );

      for (const meeting of upcomingMeetings) {
        try {
          // Check if bot is already initialized
          const existingBot = await ExecutionLog.findOne({
            where: {
              meetingId: meeting.meetingId,
              meetingICalUID: meeting.id,
              userId: meeting.userId,
              status: {
                [Op.in]: [ExecutionLogEnum.PENDING, ExecutionLogEnum.RUNNING],
              },
            },
          });

          if (existingBot) {
            console.log(`Bot already initialized for meeting ${meeting.id}`);
            continue;
          }

          // Get organization from user's organization membership
          const userOrg = meeting.user.organizationMembers?.[0]?.organization;
          const cueMeetApiKey = userOrg.dataValues.cueMeetApiKey;
          if (!cueMeetApiKey) {
            console.error(
              `No CueMeet API key found for organization of user ${meeting.userId}`,
            );
            continue;
          }

          // Create bot using CueMeet service with organization's API key
          const meetingBot = await this.cueMeetService.createBot(
            cueMeetApiKey,
            `CueHire Assistant`,
            meeting.meetLink,
          );

          // Update meeting with bot ID
          await meeting.update({
            cuemeetBotId: meetingBot.id,
          });

          // Create execution log with proper types
          const executionLogData = {
            userId: meeting.userId,
            botUsedId: userOrg.cueMeetUserId,
            botId: meetingBot.id,
            meetingId: meeting.id,
            meetingICalUID: meeting.id,
            status: ExecutionLogEnum.RUNNING,
            jobId: meeting.jobId,
          };

          await ExecutionLog.create(executionLogData);

          console.log(`Successfully initialized bot for meeting ${meeting.id}`);
        } catch (error) {
          console.error(
            `Error initializing bot for meeting ${meeting.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error('Error in meeting bot initialization job:', error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async getMeetingTranscript() {
    console.log('Running periodic meeting transcript sync...');

    try {
      const runningBots = await ExecutionLog.findAll({
        where: {
          status: ExecutionLogEnum.RUNNING,
        },
        include: [
          {
            model: Meeting,
            as: 'meetingByICalUID',
            required: true,
            include: [
              {
                model: User,
                as: 'user',
                required: true,
                include: [
                  {
                    model: OrganizationMember,
                    required: true,
                    include: [
                      {
                        model: Organization,
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      console.log(
        `Found ${runningBots.length} running bots to check for transcripts`,
      );

      // Track processed meetings to avoid duplicates
      const processedMeetings = new Set<string>();

      // Process bots in batches of 10 to avoid overwhelming the system
      const BATCH_SIZE = 10;
      for (let i = 0; i < runningBots.length; i += BATCH_SIZE) {
        const batch = runningBots.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (bot) => {
            try {
              // Skip if we've already processed this meeting
              if (processedMeetings.has(bot.meetingId)) {
                console.log(`Skipping duplicate meeting ${bot.meetingId}`);
                return;
              }
              processedMeetings.add(bot.meetingId);

              const meeting = bot.meetingByICalUID;
              if (!meeting) {
                throw new Error('Associated meeting not found');
              }

              // Get organization from user's organization membership
              const userOrg =
                meeting.user.organizationMembers?.[0]?.organization;

              const cueMeetApiKey = userOrg.dataValues.cueMeetA;
              if (!cueMeetApiKey) {
                console.error(
                  `No CueMeet API key found for organization of user ${meeting.userId}`,
                );
                return;
              }

              // First check bot status
              const botStatus = await this.cueMeetService.retrieveBot(
                cueMeetApiKey,
                bot.botId,
              );

              console.log(`Bot ${bot.botId} status:`, botStatus?.status);

              // Only proceed if bot is completed
              if (botStatus?.status === ExecutionLogEnum.COMPLETED) {
                // Add job to transcript processing queue
                await this.transcriptQueue.add(
                  TRANSCRIPT_PROCESSING_JOB,
                  {
                    meetingId: meeting.meetingId,
                    botId: bot.botId,
                    apiKey: cueMeetApiKey,
                    jobId: meeting.jobId,
                  },
                  {
                    attempts: 3,
                    backoff: {
                      type: 'exponential',
                      delay: 5000,
                    },
                  },
                );

                console.log(
                  `Added transcript processing job for meeting ${bot.meetingId}`,
                );
              } else if (botStatus?.status === ExecutionLogEnum.FAILED) {
                // If bot reports failed status, update our record
                await bot.update({
                  status: ExecutionLogEnum.FAILED,
                });
                console.log(
                  `Bot ${bot.botId} reported failed status, updated record`,
                );
              } else {
                console.log(
                  `Bot ${bot.botId} is not completed yet. Current status: ${botStatus?.status}`,
                );
              }
            } catch (error) {
              console.error(
                `Error processing transcript for bot ${bot.id}:`,
                error.message,
              );

              // Update execution log to failed status if there's an error
              await bot.update({
                status: ExecutionLogEnum.FAILED,
              });
            }
          }),
        );
      }
    } catch (error) {
      console.error('Error in meeting transcript sync job:', error);
    }
  }
}
