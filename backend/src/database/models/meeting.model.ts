import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Model,
  Table,
  BelongsTo,
  ForeignKey,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Job } from './job.model';
import { MeetingAttendees } from './meeting-attendees';
import {
  MeetingPlatformEnum,
  MeetingStatusEnum,
  MeetingTypeEnum,
} from '../../utils/enums';
import { InterviewLog } from './interview-log.model';

@ObjectType()
@Table({ tableName: 'meetings' })
export class Meeting extends Model {
  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  @Index({ unique: true })
  id: string;

  @Field()
  @Column({
    allowNull: false,
  })
  @Index({ unique: true })
  meetingId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Field(() => MeetingPlatformEnum)
  @Column({
    type: DataType.ENUM(...Object.values(MeetingPlatformEnum)),
    allowNull: false,
  })
  platform: MeetingPlatformEnum;

  @Field(() => MeetingTypeEnum)
  @Column({
    type: DataType.ENUM(...Object.values(MeetingTypeEnum)),
    allowNull: false,
  })
  meetingType: MeetingTypeEnum;

  @Field()
  @Column({
    allowNull: false,
  })
  title: string;

  @Field()
  @Column({
    allowNull: false,
  })
  meetLink: string;

  @Field()
  @Column({
    allowNull: false,
  })
  startTime: string;

  @Field()
  @Column({
    allowNull: false,
  })
  endTime: string;

  @Field({ nullable: true })
  @Column({
    allowNull: true,
  })
  timeZone: string;

  @Field(() => MeetingStatusEnum)
  @Column({
    type: DataType.ENUM(...Object.values(MeetingStatusEnum)),
    allowNull: false,
  })
  status: MeetingStatusEnum;

  @Field()
  @Column({
    allowNull: false,
    defaultValue: false,
  })
  isRecordingEnabled: boolean;

  @Field()
  @Column({
    allowNull: false,
    defaultValue: false,
  })
  hasTranscription: boolean;

  @Field({ nullable: true })
  @Column({
    allowNull: true,
  })
  cuemeetBotId: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  transcriptionSummary: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  technicalSkillsScore: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  communicationSkillsScore: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  problemSolvingScore: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  cultureFitScore: number;

  @Field({ nullable: true })
  @Column({
    allowNull: true,
  })
  rrule: string;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  jobId: string;

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

  @Field(() => Job)
  @BelongsTo(() => Job, {
    foreignKey: 'jobId',
    as: 'job',
  })
  job: Job;

  @Field(() => User)
  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user',
  })
  user: User;

  @Field(() => [MeetingAttendees])
  @HasMany(() => MeetingAttendees, {
    foreignKey: 'meetingId',
    sourceKey: 'meetingId',
    as: 'attendees',
  })
  attendees: MeetingAttendees[];

  @Field(() => InterviewLog, { nullable: true })
  @HasOne(() => InterviewLog, {
    foreignKey: 'meetingId',
    sourceKey: 'meetingId',
    as: 'interviewLog',
  })
  interviewLog?: InterviewLog;
}
