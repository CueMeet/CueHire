import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DataType,
  Index,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';

@ObjectType()
@Table({
  tableName: 'organizations',
})
export class Organization extends Model {
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

  @Field(() => Boolean, { nullable: false })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isDemo: boolean;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cueMeetUserId?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cueMeetApiKey?: string;

  @Field(() => String, { nullable: false })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'UTC',
  })
  timezone: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  ownerId: string;

  @BelongsTo(() => User, { foreignKey: 'ownerId' })
  owner: User;

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
  tableName: 'organization_members',
})
export class OrganizationMember extends Model {
  @Field()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  @Index({ unique: true })
  id: string;

  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  organizationId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Field(() => String)
  @Column({
    type: DataType.ENUM('OWNER', 'ADMIN', 'MEMBER'),
    allowNull: false,
    defaultValue: 'MEMBER',
  })
  role: string;

  @BelongsTo(() => Organization)
  organization: Organization;

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
