import { Field, ObjectType } from '@nestjs/graphql';
import { OrganizationMember } from 'src/database/models';

@ObjectType()
export class AddMemberResult {
  @Field()
  email: string;

  @Field()
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => OrganizationMember, { nullable: true })
  member?: OrganizationMember;
}
