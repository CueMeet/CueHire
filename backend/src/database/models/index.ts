import { User } from './user.model';
import { Meeting } from './meeting.model';
import { MeetingAttendees } from './meeting-attendees';
import { ExecutionLog } from './execution-log.model';
import { Organization, OrganizationMember } from './organization.model';
import { Job, JobTeamMember } from './job.model';
import { InterviewLog } from './interview-log.model';

export const Models = [
  User,
  Meeting,
  MeetingAttendees,
  ExecutionLog,
  Organization,
  OrganizationMember,
  Job,
  JobTeamMember,
  InterviewLog,
];

export {
  User,
  Meeting,
  MeetingAttendees,
  ExecutionLog,
  Organization,
  OrganizationMember,
  Job,
  JobTeamMember,
  InterviewLog,
};
