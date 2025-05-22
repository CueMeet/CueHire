import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class GetTranscriptInput {
  @Field(() => String)
  meetingId: string;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 50;
}
