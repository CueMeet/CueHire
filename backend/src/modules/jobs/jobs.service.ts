import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Job,
  JobTeamMember,
  User,
  OrganizationMember,
} from '../../database/models';
import { JobStatusEnum as JobStatus } from '../../utils/enums';
import { CreateJobDto } from './input/create-job.input';

@Injectable()
export class JobsService {
  constructor() {}

  async create(
    createJobDto: CreateJobDto,
    organizationId: string,
    userId: string,
  ): Promise<Job> {
    // Verify user is a member of the organization
    const member = await OrganizationMember.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    // Verify all team members are part of the organization
    if (createJobDto.teamMembers?.length) {
      const teamMembers = await OrganizationMember.findAll({
        where: {
          organizationId,
          userId: createJobDto.teamMembers,
        },
      });

      if (teamMembers.length !== createJobDto.teamMembers.length) {
        throw new BadRequestException(
          'Some team members are not part of the organization',
        );
      }
    }

    const job = await Job.create({
      ...createJobDto,
      organizationId: organizationId.toString(),
      createdById: userId,
      status: JobStatus.OPEN,
    });

    if (createJobDto.teamMembers?.length) {
      await JobTeamMember.bulkCreate(
        createJobDto.teamMembers.map((memberId) => ({
          jobId: job.id,
          userId: memberId,
        })),
      );
    }

    return this.findOne(job.id, organizationId);
  }

  async findAll(organizationId: string): Promise<Job[]> {
    return Job.findAll({
      where: { organizationId: organizationId.toString() },
      include: [
        {
          model: JobTeamMember,
          include: [
            { model: User, attributes: ['id', 'email', 'name', 'avatar'] },
          ],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string, organizationId: string): Promise<Job> {
    const job = await Job.findOne({
      where: {
        id,
        organizationId: organizationId.toString(),
      },
      include: [
        {
          model: JobTeamMember,
          include: [
            { model: User, attributes: ['id', 'email', 'name', 'avatar'] },
          ],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'email', 'name', 'avatar'],
        },
      ],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }
}
