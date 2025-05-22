import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserData {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  avatar: string;
}

@ObjectType()
export class OrganizationData {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  isDemo: boolean;

  @Field()
  timezone: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => UserData)
  user: UserData;

  @Field(() => OrganizationData, { nullable: true })
  organization: OrganizationData;
}
