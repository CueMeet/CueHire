import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import { LOGIN_WITH_GOOGLE } from '@/graphql/Auth';
import { OrganizationSetup } from '@/components/OrganizationSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { setUser, setToken } = useAuthStore();
  const { setOrganization, setDemoOrganization } = useOrganizationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('code');
      if (!token) {
        setError('No token provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await client.mutate({
          mutation: LOGIN_WITH_GOOGLE,
          variables: { token },
        });

        const { accessToken, user, organization } = data.loginWithGoogle;
        
        setToken(accessToken);
        setUser(user);
        if (organization.isDemo) {
          setDemoOrganization(organization);
        } else {
          setOrganization(organization);
        }

        if (!organization?.name) {
          setShowSetup(true);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, client, setUser, setToken, setOrganization, navigate, setDemoOrganization]);

  const handleSetupComplete = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Signing in...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSetup) {
    return <OrganizationSetup onComplete={handleSetupComplete} />;
  }

  return null;
};

export default AuthCallback; 