import { registerEnumType } from '@nestjs/graphql';

export enum MeetingStatusEnum {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

registerEnumType(MeetingStatusEnum, {
  name: 'MeetingStatusEnum',
});

export enum MeetingPlatformEnum {
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  TEAMS = 'ms_teams',
}

registerEnumType(MeetingPlatformEnum, {
  name: 'MeetingPlatformEnum',
});

export enum MeetingTypeEnum {
  RECURRING = 'RECURRING',
  NON_RECURRING = 'NON_RECURRING',
}

registerEnumType(MeetingTypeEnum, {
  name: 'MeetingTypeEnum',
});

export enum JobStatusEnum {
  OPEN = 'Open',
  CLOSED = 'Closed',
  DRAFT = 'Draft',
}

registerEnumType(JobStatusEnum, {
  name: 'JobStatusEnum',
});
