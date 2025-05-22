import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { ScheduleInterviewInput } from './input/schedule-interview.input';
import { UpdateInterviewInput } from './input/update-interview.input';
import {
  DeleteInterviewInput,
  DeleteInterviewResponse,
} from './input/delete-interview.input';
import {
  GetInterviewsInput,
  InterviewsResponse,
} from './input/get-interviews.input';
import { Meeting } from '../../database/models';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../database/models';
import { MeetingTranscriptResponse } from './types/transcript.types';
import { CueMeetService } from '../../providers/cuemeet/cuemeet.service';
import { GetTranscriptInput } from './input/get-transcript.input';
import { DashboardAnalyticsResponse } from './input/dashboard-analytics.input';

@Resolver(() => Meeting)
@UseGuards(AuthGuard)
export class InterviewsResolver {
  constructor(
    private readonly interviewsService: InterviewsService,
    private readonly cueMeetService: CueMeetService,
  ) {}

  @Query(() => InterviewsResponse)
  async getInterviews(
    @Args('input') input: GetInterviewsInput,
    @CurrentUser() user: User,
  ) {
    return this.interviewsService.getInterviews(user, input);
  }

  @Mutation(() => Meeting)
  async scheduleInterview(
    @Args('input') input: ScheduleInterviewInput,
    @CurrentUser() user: User,
  ) {
    return this.interviewsService.scheduleInterview(user, input);
  }

  @Mutation(() => Meeting)
  async updateInterview(
    @Args('input') input: UpdateInterviewInput,
    @CurrentUser() user: User,
  ) {
    return this.interviewsService.updateInterview(user, input);
  }

  @Mutation(() => DeleteInterviewResponse)
  async deleteInterview(
    @Args('input') input: DeleteInterviewInput,
    @CurrentUser() user: User,
  ) {
    return this.interviewsService.deleteInterview(user, input);
  }

  @Query(() => MeetingTranscriptResponse)
  @UseGuards(AuthGuard)
  async getMeetingTranscript(
    @Args('input') input: GetTranscriptInput,
    @CurrentUser() user: User,
  ): Promise<MeetingTranscriptResponse> {
    return this.interviewsService.getMeetingTranscript(user, input);
  }

  @Query(() => DashboardAnalyticsResponse)
  async getDashboardAnalytics(
    @CurrentUser() user: User,
  ): Promise<DashboardAnalyticsResponse> {
    return this.interviewsService.getDashboardAnalytics(user);
  }
}
