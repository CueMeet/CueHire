import { gql } from '@apollo/client';

export const CREATE_JOB = gql`
  mutation CreateJob($organizationId: ID!, $input: CreateJobDto!) {
    createJob(organizationId: $organizationId, input: $input) {
      id
      title
      description
      location
      type
      status
      teamMembers {
        user {
          id
          email
          name
          avatar
        }
      }
      createdBy {
        id
        email
        name
        avatar
      }
      createdAt
    }
  }
`;

export const GET_JOBS = gql`
  query GetJobs($organizationId: ID!) {
    getJobs(organizationId: $organizationId) {
      id
      title
      description
      location
      type
      status
      teamMembers {
        user {
          id
          email
          name
          avatar
        }
      }
      createdBy {
        id
        email
        name
        avatar
      }
      createdAt
    }
  }
`;

export const GET_JOB = gql`
  query GetJob($organizationId: ID!, $jobId: ID!) {
    getJob(organizationId: $organizationId, jobId: $jobId) {
      id
      title
      description
      location
      type
      status
      teamMembers {
        user {
          id
          email
          name
          avatar
        }
      }
      createdBy {
        id
        email
        name
        avatar
      }
      createdAt
    }
  }
`; 