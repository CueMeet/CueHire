import { gql } from '@apollo/client';

export const SCHEDULE_INTERVIEW = gql`
  mutation ScheduleInterview($input: ScheduleInterviewInput!) {
    scheduleInterview(input: $input) {
      id
      meetingId
      title
      meetLink
      startTime
      endTime
      status
    }
  }
`;

export const GET_INTERVIEWS = gql`
  query GetInterviews($input: GetInterviewsInput!) {
    getInterviews(input: $input) {
      interviews {
        id
        meetingId
        title
        meetLink
        startTime
        endTime
        timeZone
        status
        hasTranscription
        communicationSkillsScore
        cultureFitScore
        problemSolvingScore
        technicalSkillsScore
        transcriptionSummary
        createdAt
        updatedAt
        attendees {
          userId
          displayName
          email
        }
        job {
          id
          title
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`; 

export const UPDATE_INTERVIEW = gql`
  mutation UpdateInterview($input: UpdateInterviewInput!) {
    updateInterview(input: $input) {
      id
      title
      startTime
      endTime
    }
  }
`; 

export const DELETE_INTERVIEW = gql`
  mutation DeleteInterview($input: DeleteInterviewInput!) {
    deleteInterview(input: $input) {
      success
      message
    }
  }
`; 

export const GET_MEETING_TRANSCRIPT = gql`
  query getMeetingTranscript($input: GetTranscriptInput!) {
    getMeetingTranscript(input: $input) {
      transcript {
        id
        speaker
        transcription_Data
        transcription_end_time_milliseconds
        transcription_start_time_milliseconds
      }
      attendees {
        id
        email
        displayName
      }
    	hasMore
      limit
      page
      total
      totalPages
    }
  }
`;

export const GET_DASHBOARD_ANALYTICS = gql`
  query GetDashboardAnalytics {
    getDashboardAnalytics {
      activeJobs
      interviewsThisMonth
      interviewsThisWeek
      upcomingInterviews {
        id
        title
        startTime
      }
    }
  }
`;