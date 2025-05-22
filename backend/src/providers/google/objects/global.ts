import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GlobalResponse {
  @Field(() => Int)
  status: number;

  @Field(() => String)
  message: string;
}
