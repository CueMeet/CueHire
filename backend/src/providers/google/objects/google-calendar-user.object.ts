import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarUserObject {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  displayName: string;
}
