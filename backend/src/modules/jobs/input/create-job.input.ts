import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { JobType } from '../../../database/models/job.model';
import { JobStatusEnum as JobStatus } from '../../../utils/enums';

@InputType()
export class CreateJobDto {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  location: string;

  @Field(() => String)
  @IsEnum(JobType)
  type: JobType;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  teamMembers?: string[];

  @Field(() => String, { nullable: true })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}
