import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { 
  GET_MY_ORGANIZATION, 
  GET_ORGANIZATION_MEMBERS,
  UPDATE_ORGANIZATION_NAME,
  ADD_TEAM_MEMBER 
} from '../graphql/Auth';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  isDemo: boolean;
  cueMeetApiKey?: string;
  cueMeetUserId?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationMember {
  id: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface OrganizationState {
  organization: Organization | null;
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;
  setOrganization: (org: Organization | null) => void;
  setDemoOrganization: (org: Organization | null) => void;
  setMembers: (members: OrganizationMember[]) => void;
  fetchOrganization: (client: ApolloClient<NormalizedCacheObject>) => Promise<void>;
  fetchMembers: (client: ApolloClient<NormalizedCacheObject>, organizationId: string) => Promise<void>;
  reset: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organization: null,
      members: [],
      isLoading: false,
      error: null,
      
      setOrganization: (org) => set({ organization: org }),
      setDemoOrganization: (org) => set({ organization: { ...org, isDemo: true } }),
      setMembers: (members) => set({ members }),
      
      fetchOrganization: async (client) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await client.query({
            query: GET_MY_ORGANIZATION,
            fetchPolicy: 'network-only',
          });
          set({ organization: data.getMyOrganization, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchMembers: async (client, organizationId) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await client.query({
            query: GET_ORGANIZATION_MEMBERS,
            variables: { organizationId },
            fetchPolicy: 'network-only',
          });
          set({ members: data.getOrganizationMembers, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      reset: () => set({ organization: null, members: [], isLoading: false, error: null }),
    }),
    {
      name: 'organization-storage',
    }
  )
); 