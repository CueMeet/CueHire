import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Meeting } from '../../../database/models';

@InputType()
export class GetInterviewsInput {
  @Field(() => String)
  @IsUUID()
  jobId: string;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}

@ObjectType()
export class InterviewsResponse {
  @Field(() => [Meeting])
  interviews: Meeting[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
