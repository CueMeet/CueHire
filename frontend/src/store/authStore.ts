import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GET_ME } from '../graphql/Auth';
import { useOrganizationStore } from './organizationStore';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  cueMeetApiKey?: string;
  cueMeetUserId?: string;
  googleCalendarChannelId?: string;
  googleCalendarResourceId?: string;
  googleCalendarSyncToken?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  fetchUser: (client: ApolloClient<NormalizedCacheObject>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),

      fetchUser: async (client) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await client.query({
            query: GET_ME,
            fetchPolicy: 'network-only',
          });
          
          if (data.me) {
            set({ user: data.me, isAuthenticated: true, isLoading: false });
            // Fetch organization data after successful user fetch
            await useOrganizationStore.getState().fetchOrganization(client);
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useOrganizationStore.getState().reset();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 