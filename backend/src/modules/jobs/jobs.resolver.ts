import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from '../../database/models/job.model';
import { CreateJobDto } from './input/create-job.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../database/models/user.model';

@Resolver(() => Job)
@UseGuards(AuthGuard)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job])
  async getJobs(
    @CurrentUser() user: User,
    @Args('organizationId', { type: () => ID }) organizationId: string,
  ) {
    return this.jobsService.findAll(organizationId);
  }

  @Query(() => Job, { nullable: true })
  async getJob(
    @CurrentUser() user: User,
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('jobId', { type: () => ID }) jobId: string,
  ) {
    return this.jobsService.findOne(jobId, organizationId);
  }

  @Mutation(() => Job)
  async createJob(
    @CurrentUser() user: User,
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('input') input: CreateJobDto,
  ) {
    return this.jobsService.create(input, organizationId, user.id);
  }
}
