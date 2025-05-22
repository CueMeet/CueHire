import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEmail, IsDate, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ScheduleInterviewInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsEmail()
  candidateEmail: string;

  @Field()
  @IsString()
  candidateName: string;

  @Field(() => String)
  @IsUUID()
  jobId: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @Field()
  @IsString()
  startTime: string;

  @Field()
  @IsString()
  endTime: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  attendees: string[];

  @Field()
  @IsString()
  timezone: string;
}
