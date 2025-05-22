import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class AddTeamMemberInput {
  @Field()
  @IsUUID()
  organizationId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(['ADMIN', 'MEMBER'])
  role?: 'ADMIN' | 'MEMBER';
}
