import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Organization } from './organization.model';
import { Meeting } from './meeting.model';
import { JobStatusEnum } from '../../utils/enums';

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
}

registerEnumType(JobType, {
  name: 'JobType',
});

@ObjectType()
@Table({
  tableName: 'jobs',
})
export class Job extends Model {
  @Field(() => ID)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  @Index({ unique: true })
  id: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Field()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location: string;

  @Field(() => String)
  @Column({
    type: DataType.ENUM(...Object.values(JobType)),
    allowNull: false,
    defaultValue: JobType.FULL_TIME,
  })
  type: JobType;

  @Field(() => String)
  @Column({
    type: DataType.ENUM(...Object.values(JobStatusEnum)),
    allowNull: false,
    defaultValue: JobStatusEnum.DRAFT,
  })
  status: JobStatusEnum;

  @Field()
  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  organizationId: string;

  @Field()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  createdById: string;

  @Field(() => [JobTeamMember])
  @HasMany(() => JobTeamMember)
  teamMembers: JobTeamMember[];

  @Field(() => [Meeting])
  @HasMany(() => Meeting)
  meetings: Meeting[];

  @Field(() => User)
  @BelongsTo(() => User, { foreignKey: 'createdById' })
  createdBy: User;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;
}

@ObjectType()
@Table({
  tableName: 'job_team_members',
})
export class JobTeamMember extends Model {
  @Field(() => ID)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  @Index({ unique: true })
  id: string;

  @Field(() => ID)
  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  jobId: string;

  @Field(() => ID)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Field(() => Job)
  @BelongsTo(() => Job)
  job: Job;

  @Field(() => User)
  @BelongsTo(() => User)
  user: User;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;
}
