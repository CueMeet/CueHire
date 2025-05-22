import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useOrganizationStore } from '@/store/organizationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, ArrowRight, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { UPDATE_ORGANIZATION_NAME, ADD_TEAM_MEMBER } from '@/graphql/Auth';

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { organization, setOrganization, setDemoOrganization } = useOrganizationStore();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [teamEmail, setTeamEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!organization?.isDemo) {
    navigate('/dashboard');
    return null;
  }

  const handleUpdateOrgName = async () => {
    if (!orgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_ORGANIZATION_NAME,
        variables: { name: orgName, organizationId: organization.id },
      });
      if (!data || !data.updateOrganizationName) {
        throw new Error('Failed to update organization name');
      }
      setOrganization(data.updateOrganizationName);
      toast.success('Organization name updated successfully');
      setStep(2);
    } catch (error) {
      toast.error('Failed to update organization name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!teamEmail.trim()) {
      toast.error('Please enter a team member email');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await client.mutate({
        mutation: ADD_TEAM_MEMBER,
        variables: { 
          input: {
            email: teamEmail,
            organizationId: organization.id,
            role: 'MEMBER'
          }
        },
      });
      if (!data || !data.addTeamMember.success) {
        throw new Error(data?.addTeamMember?.error || 'Failed to add team member');
      }
      setDemoOrganization(organization);
      toast.success('Team member added successfully');
      setTeamEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setDemoOrganization(organization);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? 'Welcome to CueHire!' : 'Add Team Member'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 
              ? 'Let\'s set up your organization to get started'
              : 'Invite your team members to collaborate'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter your organization name"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdateOrgName} 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamEmail">Team Member Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="teamEmail"
                    type="email"
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    placeholder="Enter team member's email"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddTeamMember} 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="gap-2"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip for now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationOnboarding; 