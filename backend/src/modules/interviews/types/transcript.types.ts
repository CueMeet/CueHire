import { Field, ObjectType, Int } from '@nestjs/graphql';
import { MeetingAttendees } from '../../../database/models';

@ObjectType()
export class TranscriptSegment {
  @Field()
  id: string;

  @Field()
  speaker: string;

  @Field()
  transcription_Data: string;

  @Field()
  transcription_start_time_milliseconds: string;

  @Field()
  transcription_end_time_milliseconds: string;
}

@ObjectType()
export class MeetingTranscriptResponse {
  @Field(() => [TranscriptSegment], { nullable: true })
  transcript: TranscriptSegment[];

  @Field(() => [MeetingAttendees])
  attendees: MeetingAttendees[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
