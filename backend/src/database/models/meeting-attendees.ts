import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Model,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Meeting } from './meeting.model';
import { User } from './user.model';

@ObjectType()
@Table({
  tableName: 'meetingAttendees',
})
export class MeetingAttendees extends Model<MeetingAttendees> {
  @Field()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Field(() => String)
  @ForeignKey(() => Meeting)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  meetingId: string;

  @Field(() => String)
  @ForeignKey(() => Meeting)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  meetingICalUID: string;

  @Field(() => String, { nullable: true })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId: string;

  @Field(() => String)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  displayName: string;

  @Field(() => String)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Field(() => Meeting)
  @BelongsTo(() => Meeting, {
    foreignKey: 'meetingId',
    targetKey: 'meetingId',
    as: 'meeting',
  })
  meeting: Meeting;

  @Field(() => Meeting)
  @BelongsTo(() => Meeting, {
    foreignKey: 'meetingICalUID',
    targetKey: 'id',
    as: 'meetingByICalUID',
  })
  meetingByICalUID: Meeting;

  @Field(() => User, { nullable: true })
  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user',
  })
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
