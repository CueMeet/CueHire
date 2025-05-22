import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class DeleteInterviewInput {
  @Field()
  @IsString()
  eventId: string;
}

@ObjectType()
export class DeleteInterviewResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
