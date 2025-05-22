import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client';
import { REFRESH_TOKEN } from './Auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { HttpLink } from '@apollo/client/link/http';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
  credentials: 'include'
});

const headersLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err?.message === 'Token expired!') {
        if (operation.operationName === 'refreshToken') {
          useAuthStore.getState().logout();
          return;
        }

        return new Observable(observer => {
          refreshAccessToken()
            .then(newAccessToken => {
              if (newAccessToken) {
                useAuthStore.getState().setToken(newAccessToken);
                forward(operation).subscribe(observer);
              } else {
                useAuthStore.getState().logout();
                window.location.href = '/';
              }
            })
            .catch(() => {
              useAuthStore.getState().logout();
              window.location.href = '/';
            });
        });
      }
      
      // Handle Unauthorized error
      if (err?.message === 'Unauthorized') {
        useAuthStore.getState().logout();
        window.location.href = '/';
        return;
      }
    }
  }

  if (networkError) {
    if (networkError.message.includes('Failed to fetch')) {
      toast('Offline. Syncing will resume once connected.', {
        icon: '🌐',
        duration: 4000,
      });
    } else {
      console.log('network error', networkError)
    }
  }
});

async function refreshAccessToken() {
  try {
    const response = await apolloClient.mutate({
      mutation: REFRESH_TOKEN
    });
    return response.data?.refreshToken?.accessToken;
  } catch {
    return null;
  }
}

export const apolloClient = new ApolloClient({
  link: from([errorLink, headersLink, httpLink]),
  cache: new InMemoryCache({ addTypename: false }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

