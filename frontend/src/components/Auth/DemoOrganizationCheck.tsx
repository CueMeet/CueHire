import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganizationStore } from '@/store/organizationStore';

interface DemoOrganizationCheckProps {
  children: React.ReactNode;
}

const DemoOrganizationCheck = ({ children }: DemoOrganizationCheckProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization } = useOrganizationStore();

  useEffect(() => {
    // Skip check if we're already on the onboarding page
    if (location.pathname === '/organization-onboarding') {
      return;
    }

    // Redirect to onboarding if organization is in demo mode
    if (organization?.isDemo) {
      navigate('/organization-onboarding');
    }
  }, [organization, navigate, location]);

  return <>{children}</>;
};

export default DemoOrganizationCheck; 