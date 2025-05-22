import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEmail, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateInterviewInput {
  @Field()
  @IsString()
  eventId: string;

  @Field({ nullable: true })
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsEmail()
  candidateEmail?: string;

  @Field({ nullable: true })
  @IsString()
  candidateName?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @Field({ nullable: true })
  @IsString()
  startTime?: string;

  @Field({ nullable: true })
  @IsString()
  endTime?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];

  @Field({ nullable: true })
  @IsString()
  timezone?: string;
}
