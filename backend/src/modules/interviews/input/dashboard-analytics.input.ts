import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Meeting } from '../../../database/models';

@ObjectType()
export class DashboardAnalyticsResponse {
  @Field(() => Int)
  interviewsThisWeek: number;

  @Field(() => Int)
  interviewsThisMonth: number;

  @Field(() => Int)
  activeJobs: number;

  @Field(() => [Meeting])
  upcomingInterviews: Meeting[];
}
