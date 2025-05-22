import { gql } from "@apollo/client";

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($token: String!) {
    loginWithGoogle(token: $token) {
      accessToken
      organization {
        id
        name
        isDemo
      }
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation refreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      avatar
      cueMeetApiKey
      cueMeetUserId
      googleCalendarChannelId
      googleCalendarResourceId
      googleCalendarSyncToken
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORGANIZATION = gql`
  query GetMyOrganization {
    getMyOrganization {
      id
      name
      isDemo
      cueMeetApiKey
      cueMeetUserId
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORGANIZATION_MEMBERS = gql`
  query GetOrganizationMembers($organizationId: String!) {
    getOrganizationMembers(organizationId: $organizationId) {
      id
      role
      createdAt
      updatedAt
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const UPDATE_ORGANIZATION_NAME = gql`
  mutation UpdateOrganizationName($name: String!, $organizationId: String!) {
    updateOrganizationName(name: $name, organizationId: $organizationId) {
      id
      name
      isDemo
      createdAt
      updatedAt
    }
  }
`;

export const ADD_TEAM_MEMBER = gql`
  mutation AddTeamMember($input: AddTeamMemberInput!) {
    addTeamMember(input: $input) {
      email
      success
      error
      member {
        id
        createdAt
        updatedAt
      }
    }
  }
`;