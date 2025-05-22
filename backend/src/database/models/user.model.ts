import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Table,
  Model,
  HasMany,
} from 'sequelize-typescript';
import { OrganizationMember } from './organization.model';

@ObjectType()
@Table({
  tableName: 'user',
})
export class User extends Model {
  @Field()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  @Index({ unique: true })
  id: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  sub: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  googleAccessToken: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  googleRefreshToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  googleTokenExpiry: Date;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  googleCalendarChannelId?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  googleCalendarResourceId?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  googleCalendarSyncToken?: string;

  @Field(() => [OrganizationMember])
  @HasMany(() => OrganizationMember)
  organizationMembers: OrganizationMember[];

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
