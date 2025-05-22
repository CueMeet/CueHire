import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { GoogleService } from '../../providers/google/google.service';
import { ScheduleInterviewInput } from './input/schedule-interview.input';
import {
  GetInterviewsInput,
  InterviewsResponse,
} from './input/get-interviews.input';
import {
  MeetingPlatformEnum,
  MeetingStatusEnum,
  MeetingTypeEnum,
} from '../../utils/enums';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Meeting,
  MeetingAttendees,
  Job,
  JobTeamMember,
  InterviewLog,
  OrganizationMember,
  Organization,
} from '../../database/models';
import { UpdateInterviewInput } from './input/update-interview.input';
import { DeleteInterviewInput } from './input/delete-interview.input';
import { Op } from 'sequelize';
import { GetTranscriptInput } from './input/get-transcript.input';
import { MeetingTranscriptResponse } from './types/transcript.types';
import { CueMeetService } from '../../providers/cuemeet/cuemeet.service';
import { DashboardAnalyticsResponse } from './input/dashboard-analytics.input';
import { JobStatusEnum as JobStatus } from '../../utils/enums';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private googleService: GoogleService,
    private cueMeetService: CueMeetService,
  ) {}

  async getDashboardAnalytics(user: User): Promise<DashboardAnalyticsResponse> {
    try {
      // Get current date and calculate week/month start dates
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get all jobs where user is a team member
      const userJobs = await Job.findAll({
        include: [
          {
            model: JobTeamMember,
            where: { userId: user.id },
            required: true,
          },
        ],
      });

      const jobIds = userJobs.map((job) => job.id);

      // Get interviews for this week
      const interviewsThisWeek = await Meeting.count({
        where: {
          jobId: { [Op.in]: jobIds },
          startTime: { [Op.gte]: startOfWeek.toISOString() },
          endTime: { [Op.lte]: now.toISOString() },
        },
      });

      // Get interviews for this month
      const interviewsThisMonth = await Meeting.count({
        where: {
          jobId: { [Op.in]: jobIds },
          startTime: { [Op.gte]: startOfMonth.toISOString() },
          endTime: { [Op.lte]: now.toISOString() },
        },
      });

      // Get active jobs count (jobs that are OPEN)
      // First, let's check what statuses exist in the jobs table
      const jobsWithStatus = await Job.findAll({
        where: {
          id: { [Op.in]: jobIds },
        },
        attributes: ['id', 'status'],
      });

      const activeJobs = jobsWithStatus.filter(
        (job) => job.status === JobStatus.OPEN,
      ).length;

      // Get upcoming interviews (next 3)
      const upcomingInterviews = await Meeting.findAll({
        where: {
          jobId: { [Op.in]: jobIds },
          startTime: { [Op.gt]: now.toISOString() },
        },
        include: [
          {
            model: MeetingAttendees,
            required: false,
          },
          {
            model: Job,
            required: true,
          },
          {
            model: InterviewLog,
            as: 'interviewLog',
            required: true,
          },
        ],
        order: [['startTime', 'ASC']],
        limit: 3,
      });

      return {
        interviewsThisWeek,
        interviewsThisMonth,
        activeJobs,
        upcomingInterviews,
      };
    } catch (error) {
      this.logger.error('Error in getDashboardAnalytics:', error);
      throw error;
    }
  }

  async getInterviews(
    user: User,
    input: GetInterviewsInput,
  ): Promise<InterviewsResponse> {
    // Verify the job exists and user has access
    const job = await Job.findOne({
      where: { id: input.jobId },
      include: [
        {
          model: JobTeamMember,
          where: { userId: user.id },
          required: false,
        },
      ],
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    // Check if user is a team member of the job
    const isTeamMember = job.teamMembers.some(
      (member) => member.userId === user.id,
    );
    if (!isTeamMember) {
      throw new BadRequestException('You do not have access to this job');
    }

    // Build where clause
    const where = {
      jobId: input.jobId,
    };

    // Calculate pagination
    const offset = (input.page - 1) * input.limit;

    // Get total count
    const total = await Meeting.count({
      where,
      include: [
        {
          model: MeetingAttendees,
          required: false,
        },
      ],
      distinct: true,
    });

    // Get interviews with pagination
    const interviews = await Meeting.findAll({
      where,
      include: [
        {
          model: MeetingAttendees,
          required: false,
        },
        {
          model: Job,
          required: true,
        },
      ],
      order: [['startTime', 'DESC']],
      limit: input.limit,
      offset,
    });

    return {
      interviews,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
    };
  }

  async scheduleInterview(user: User, input: ScheduleInterviewInput) {
    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      throw new BadRequestException(
        'User has not connected their Google Calendar',
      );
    }

    // Check for existing interview for this candidate in the job
    const existingInterview = await InterviewLog.findOne({
      where: {
        jobId: input.jobId,
        candidateEmail: input.candidateEmail,
      },
      include: [
        {
          model: Meeting,
          required: true,
        },
      ],
    });

    if (existingInterview) {
      throw new BadRequestException(
        'This candidate already has an active interview scheduled for this job',
      );
    }

    const job = await Job.findOne({
      where: { id: input.jobId },
      include: [
        {
          model: JobTeamMember,
          where: { userId: user.id },
          required: false,
        },
      ],
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    // Check if user is a team member of the job
    const isTeamMember = job.teamMembers.some(
      (member) => member.userId === user.id,
    );
    if (!isTeamMember) {
      throw new BadRequestException('You do not have access to this job');
    }

    // Format start and end times
    const startDateTime = new Date(
      `${input.date.toISOString().split('T')[0]}T${input.startTime}`,
    );
    const endDateTime = new Date(
      `${input.date.toISOString().split('T')[0]}T${input.endTime}`,
    );

    // Validate start time is after current time
    const currentTime = new Date();
    if (startDateTime <= currentTime) {
      throw new BadRequestException(
        'Interview start time must be after current time',
      );
    }

    // Validate end time is after start time
    if (endDateTime <= startDateTime) {
      throw new BadRequestException(
        'Interview end time must be after start time',
      );
    }

    // Create Google Calendar event
    const googleEvent = await this.googleService.createMeetingEvent(
      user.id,
      {
        accessToken: user.googleAccessToken,
        refreshToken: user.googleRefreshToken,
      },
      {
        title: input.title,
        description: `Interview for ${input.candidateName} for the position of ${input.title}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: input.attendees,
        candidateName: input.candidateName,
        candidateEmail: input.candidateEmail,
        timezone: input.timezone,
      },
    );

    // Create meeting record in database
    const meeting = await Meeting.create({
      id: googleEvent.iCalUID || uuidv4(),
      meetingId: googleEvent.id || uuidv4(),
      userId: user.id,
      platform: MeetingPlatformEnum.GOOGLE_MEET,
      meetingType: MeetingTypeEnum.NON_RECURRING,
      title: input.title,
      meetLink: googleEvent.hangoutLink || '',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      timeZone: input.timezone,
      status: MeetingStatusEnum.CREATED,
      isRecordingEnabled: true,
      hasTranscription: false,
      jobId: input.jobId,
    });

    // Create interview log
    await InterviewLog.create({
      candidateName: input.candidateName,
      candidateEmail: input.candidateEmail,
      timezone: input.timezone,
      meetingId: meeting.meetingId,
      jobId: input.jobId,
    });

    // Create meeting attendees records
    const attendeePromises = [
      // Add candidate as attendee
      MeetingAttendees.create({
        meetingId: meeting.meetingId,
        meetingICalUID: meeting.id,
        userId: null,
        displayName: input.candidateName,
        email: input.candidateEmail,
      }),
      // Add other attendees
      ...input.attendees.map(async (email) => {
        const attendee = await User.findOne({ where: { email } });
        if (attendee) {
          return MeetingAttendees.create({
            meetingId: meeting.meetingId,
            meetingICalUID: meeting.id,
            userId: attendee.id,
            displayName: attendee.name,
            email: attendee.email,
          });
        }
      }),
    ];

    await Promise.all(attendeePromises.filter(Boolean));

    return meeting;
  }

  async updateInterview(user: User, input: UpdateInterviewInput) {
    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      throw new BadRequestException(
        'User has not connected their Google Calendar',
      );
    }

    // Find the existing meeting and interview log
    const meeting = await Meeting.findOne({
      where: { meetingId: input.eventId },
      include: [
        {
          model: Job,
          include: [
            {
              model: JobTeamMember,
              where: { userId: user.id },
              required: false,
            },
          ],
        },
        {
          model: InterviewLog,
          as: 'interviewLog',
          required: true,
        },
      ],
    });

    if (!meeting || !meeting.interviewLog) {
      throw new BadRequestException('Interview not found');
    }

    // If candidate email is being updated, check for duplicate interviews
    if (
      input.candidateEmail &&
      input.candidateEmail !== meeting.interviewLog.candidateEmail
    ) {
      const existingInterview = await InterviewLog.findOne({
        where: {
          jobId: meeting.jobId,
          candidateEmail: input.candidateEmail,
          meetingId: {
            [Op.ne]: meeting.meetingId,
          },
        },
        include: [
          {
            model: Meeting,
            required: true,
          },
        ],
      });

      if (existingInterview) {
        throw new BadRequestException(
          'This candidate already has an active interview scheduled for this job',
        );
      }
    }

    // Check if user is a team member of the job
    const isTeamMember = meeting.job.teamMembers.some(
      (member) => member.userId === user.id,
    );
    if (!isTeamMember) {
      throw new BadRequestException('You do not have access to this interview');
    }

    // Format start and end times if provided
    let startDateTime = new Date(meeting.startTime);
    let endDateTime = new Date(meeting.endTime);
    if (input.date && input.startTime) {
      startDateTime = new Date(
        `${input.date.toISOString().split('T')[0]}T${input.startTime}`,
      );
    }
    if (input.date && input.endTime) {
      endDateTime = new Date(
        `${input.date.toISOString().split('T')[0]}T${input.endTime}`,
      );
    }

    // Validate start time is after current time
    const currentTime = new Date();
    if (startDateTime <= currentTime) {
      throw new BadRequestException(
        'Interview start time must be after current time',
      );
    }

    // Validate end time is after start time
    if (endDateTime <= startDateTime) {
      throw new BadRequestException(
        'Interview end time must be after start time',
      );
    }

    // Update Google Calendar event
    await this.googleService.updateMeetingEvent(
      user.id,
      {
        accessToken: user.googleAccessToken,
        refreshToken: user.googleRefreshToken,
      },
      input.eventId,
      {
        title: input.title,
        description: input.candidateName
          ? `Interview for ${input.candidateName} for the position of ${input.title || meeting.title}`
          : undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: input.attendees,
        candidateName: input.candidateName,
        candidateEmail: input.candidateEmail,
        timezone: input.timezone,
      },
    );

    // Update meeting record in database
    const updatedMeeting = await meeting.update({
      title: input.title || meeting.title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      timeZone: input.timezone || meeting.timeZone,
    });

    // Update interview log if candidate details changed
    if (input.candidateName || input.candidateEmail || input.timezone) {
      const interviewLog = await InterviewLog.findOne({
        where: { meetingId: meeting.meetingId },
      });

      if (interviewLog) {
        await interviewLog.update({
          candidateName: input.candidateName || interviewLog.candidateName,
          candidateEmail: input.candidateEmail || interviewLog.candidateEmail,
          timezone: input.timezone || interviewLog.timezone,
        });
      }
    }

    // Update attendees if provided
    if (input.attendees) {
      // Delete existing attendees
      await MeetingAttendees.destroy({
        where: { meetingId: meeting.meetingId },
      });

      // Create new attendee records
      const attendeePromises = [
        // Add candidate as attendee
        MeetingAttendees.create({
          meetingId: meeting.meetingId,
          meetingICalUID: meeting.id,
          userId: null,
          displayName: input.candidateName || meeting.title,
          email: input.candidateEmail,
        }),
        // Add other attendees
        ...input.attendees.map(async (email) => {
          const attendee = await User.findOne({ where: { email } });
          if (attendee) {
            return MeetingAttendees.create({
              meetingId: meeting.meetingId,
              meetingICalUID: meeting.id,
              userId: attendee.id,
              displayName: attendee.name,
              email: attendee.email,
            });
          }
        }),
      ];

      await Promise.all(attendeePromises.filter(Boolean));
    }

    return updatedMeeting;
  }

  async deleteInterview(user: User, input: DeleteInterviewInput) {
    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      throw new BadRequestException(
        'User has not connected their Google Calendar',
      );
    }

    // Find the existing meeting with interview log
    const meeting = await Meeting.findOne({
      where: { meetingId: input.eventId },
      include: [
        {
          model: Job,
          include: [
            {
              model: JobTeamMember,
              where: { userId: user.id },
              required: false,
            },
          ],
        },
        {
          model: InterviewLog,
          as: 'interviewLog',
          required: true,
        },
      ],
    });

    if (!meeting || !meeting.interviewLog) {
      throw new BadRequestException('Interview not found');
    }

    // Check if user is a team member of the job
    const isTeamMember = meeting.job.teamMembers.some(
      (member) => member.userId === user.id,
    );
    if (!isTeamMember) {
      throw new BadRequestException('You do not have access to this interview');
    }

    // Delete Google Calendar event
    await this.googleService.deleteMeetingEvent(
      user.id,
      {
        accessToken: user.googleAccessToken,
        refreshToken: user.googleRefreshToken,
      },
      input.eventId,
    );

    // Delete meeting record, interview log, and related attendees
    await InterviewLog.destroy({
      where: { meetingId: meeting.meetingId },
    });
    await MeetingAttendees.destroy({
      where: { meetingId: meeting.meetingId },
    });
    await meeting.destroy();

    return { success: true, message: 'Interview deleted successfully' };
  }

  async getMeetingTranscript(
    user: User,
    input: GetTranscriptInput,
  ): Promise<MeetingTranscriptResponse> {
    // Find the meeting and verify user access
    const meeting = await Meeting.findOne({
      where: { id: input.meetingId },
      include: [
        {
          model: Job,
          include: [
            {
              model: JobTeamMember,
              where: { userId: user.id },
              required: false,
            },
          ],
        },
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
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if user is a team member of the job
    const isTeamMember = meeting.job.teamMembers.some(
      (member) => member.userId === user.id,
    );
    if (!isTeamMember) {
      throw new BadRequestException('You do not have access to this meeting');
    }

    // Get organization from user's organization membership
    const userOrg = meeting.user.organizationMembers?.[0]?.organization;
    if (!userOrg) {
      throw new BadRequestException('User organization not found');
    }

    const cueMeetApiKey = userOrg.cueMeetApiKey;
    if (!cueMeetApiKey) {
      throw new BadRequestException('Organization CueMeet API key not found');
    }

    // Get attendees
    const attendees = await MeetingAttendees.findAll({
      where: {
        meetingICalUID: meeting.id,
        meetingId: meeting.meetingId,
      },
    });

    let transcript = null;
    let total = 0;
    let hasMore = false;

    if (meeting.cuemeetBotId) {
      const transcriptResponse = await this.cueMeetService.retrieveTranscript(
        cueMeetApiKey,
        meeting.cuemeetBotId,
        { page: input.page, limit: input.limit },
      );

      if (transcriptResponse?.transcript) {
        transcript = transcriptResponse.transcript;
        total = transcriptResponse.total || transcript.length;
        hasMore = transcriptResponse.hasMore || false;
      }
    }

    return {
      transcript,
      attendees,
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit),
      hasMore,
    };
  }
}
