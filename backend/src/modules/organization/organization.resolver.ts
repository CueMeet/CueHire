import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { OrganizationService } from './organization.service';
import { Organization, OrganizationMember } from 'src/database/models';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/database/models';
import { AuthGuard } from 'src/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AddTeamMemberInput } from './inputs/add-team-member.input';
import { AddMemberResult } from './types/add-member-result.type';

@Resolver()
@UseGuards(AuthGuard)
export class OrganizationResolver {
  constructor(private readonly organizationService: OrganizationService) {}

  @Mutation(() => Organization)
  async updateOrganizationName(
    @CurrentUser() user: User,
    @Args('organizationId') organizationId: string,
    @Args('name') name: string,
  ) {
    return this.organizationService.updateOrganizationName(
      organizationId,
      user.id,
      name,
    );
  }

  @Mutation(() => AddMemberResult)
  async addTeamMember(
    @CurrentUser() user: User,
    @Args('input') input: AddTeamMemberInput,
  ) {
    return this.organizationService.addTeamMember(
      input.organizationId,
      user.id,
      input.email,
      input.role,
    );
  }

  @Query(() => [OrganizationMember])
  async getOrganizationMembers(
    @CurrentUser() user: User,
    @Args('organizationId') organizationId: string,
  ) {
    return this.organizationService.getOrganizationMembers(
      organizationId,
      user.id,
    );
  }

  @Query(() => Organization, { nullable: true })
  async getMyOrganization(@CurrentUser() user: User) {
    return this.organizationService.getOrganizationByUserId(user.id);
  }
}
