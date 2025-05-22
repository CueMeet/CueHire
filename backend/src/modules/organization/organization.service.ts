import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Organization, OrganizationMember, User } from 'src/database/models';
import { CueMeetService } from '../../providers/cuemeet/cuemeet.service';
import { AddMemberResult } from './types/add-member-result.type';

@Injectable()
export class OrganizationService {
  constructor(private readonly cueMeetService: CueMeetService) {}

  async createOrganizationForUser(user: User, timezone: string = 'UTC') {
    try {
      // Create CueMeet user for the organization
      const cuemeetUser = await this.cueMeetService.createUser(
        user.email,
        user.name,
      );

      // Create a new organization with the user as owner
      const organizationName =
        user.email.endsWith('@gmail.com') || user.email.endsWith('@outlook.com')
          ? 'Demo Organization'
          : `${user.email.split('@')[1].split('.')[0]}`.trim();

      const organization = await Organization.create({
        name: organizationName,
        ownerId: user.id,
        isDemo: true,
        cueMeetUserId: cuemeetUser.id,
        cueMeetApiKey: cuemeetUser.apiKey,
        timezone,
      });

      // Add the user as an owner member
      await OrganizationMember.create({
        organizationId: organization.id,
        userId: user.id,
        role: 'OWNER',
      });

      return organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async getOrganizationByUserId(userId: string) {
    const member = await OrganizationMember.findOne({
      where: { userId },
      include: [
        {
          model: Organization,
          include: [
            {
              model: User,
              as: 'owner',
            },
          ],
        },
      ],
    });

    return member?.organization;
  }

  async updateOrganizationName(
    organizationId: string,
    userId: string,
    newName: string,
  ) {
    const member = await OrganizationMember.findOne({
      where: { organizationId, userId },
      include: [Organization],
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
      throw new BadRequestException(
        'Only owners and admins can update organization name',
      );
    }

    await member.organization.update({
      name: newName,
      isDemo: false,
    });

    return member.organization;
  }

  async addTeamMember(
    organizationId: string,
    ownerId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER',
  ): Promise<AddMemberResult> {
    const organization = await Organization.findOne({
      where: { id: organizationId, ownerId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const existingMember = await OrganizationMember.findOne({
        where: { userId: user.id },
      });

      if (existingMember) {
        return {
          email,
          success: false,
          error: `User ${email} is already a member of another organization`,
        };
      }
    }

    try {
      const newUser =
        user ||
        (await User.create({
          email: email.toLowerCase(),
          name: email.split('@')[0],
        }));

      const member = await OrganizationMember.create({
        organizationId,
        userId: newUser.id,
        role,
      });

      return {
        email,
        success: true,
        member,
      };
    } catch (error) {
      return {
        email,
        success: false,
        error: `Failed to add member ${email}: ${error.message}`,
      };
    }
  }

  async getOrganizationMembers(organizationId: string, userId: string) {
    const member = await OrganizationMember.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    const members = await OrganizationMember.findAll({
      where: { organizationId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
    });

    return members;
  }
}
