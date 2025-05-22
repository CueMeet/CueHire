import { Field, ObjectType, ID } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Meeting } from './meeting.model';
import { Job } from './job.model';

@ObjectType()
@Table({
  tableName: 'interview_logs',
})
export class InterviewLog extends Model {
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
  candidateName: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  candidateEmail: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timezone: string;

  @Field()
  @ForeignKey(() => Meeting)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    references: {
      model: Meeting,
      key: 'meetingId',
    },
  })
  meetingId: string;

  @Field()
  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: Job,
      key: 'id',
    },
  })
  jobId: string;

  @Field(() => Meeting)
  @BelongsTo(() => Meeting, { foreignKey: 'meetingId', targetKey: 'meetingId' })
  meeting: Meeting;

  @Field(() => Job)
  @BelongsTo(() => Job, { foreignKey: 'jobId', targetKey: 'id' })
  job: Job;

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
