import React, { useState, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useOrganizationStore } from '../store/organizationStore';
import { toast } from 'sonner';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateEmail, validateEmails } from '../utils/validation';

interface OrganizationSetupProps {
  onComplete: () => void;
}

interface TeamMemberStatus {
  email: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
}

interface EmailInput {
  id: string;
  value: string;
  error?: string;
}

export const OrganizationSetup: React.FC<OrganizationSetupProps> = ({ onComplete }) => {
  const client = useApolloClient();
  const { organization, updateOrganizationName, addTeamMember, isLoading, error } = useOrganizationStore();
  const [step, setStep] = useState<'organization' | 'team'>('organization');
  const [orgName, setOrgName] = useState('');
  const [emailInputs, setEmailInputs] = useState<EmailInput[]>([{ id: '1', value: '' }]);
  const [teamMemberRole, setTeamMemberRole] = useState('');
  const [memberStatus, setMemberStatus] = useState<TeamMemberStatus | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const handleAddEmailInput = () => {
    const newId = (Math.max(...emailInputs.map(input => parseInt(input.id))) + 1).toString();
    setEmailInputs([...emailInputs, { id: newId, value: '' }]);
  };

  const handleRemoveEmailInput = (id: string) => {
    if (emailInputs.length === 1) {
      setEmailInputs([{ id: '1', value: '' }]);
      return;
    }
    setEmailInputs(emailInputs.filter(input => input.id !== id));
  };

  const handleEmailChange = (id: string, value: string) => {
    setEmailInputs(emailInputs.map(input => 
      input.id === id 
        ? { ...input, value, error: validateEmail(value).error }
        : input
    ));
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      await updateOrganizationName(client, orgName, organization.id);
      setStep('team');
    } catch (err) {
      console.error('Failed to update organization name:', err);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    // Get the first email input
    const email = emailInputs[0].value.trim();
    const validationResult = validateEmail(email);
    
    // Update input error
    setEmailInputs([{
      ...emailInputs[0],
      error: validationResult.error
    }]);

    // Check if email is invalid
    if (!validationResult.isValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsAddingMembers(true);
    setMemberStatus({
      email,
      status: 'pending',
      message: 'Adding...'
    });

    try {
      const result = await addTeamMember(client, email, organization.id, teamMemberRole);

      setMemberStatus({
        email,
        status: result.success ? 'success' : 'error',
        message: result.error || 'Added successfully'
      });

      if (result.success) {
        toast.success('Team member added successfully');
        // Reset form
        setEmailInputs([{ id: '1', value: '' }]);
        setTeamMemberRole('');
      } else {
        toast.error(result.error || 'Failed to add team member');
      }
    } catch (err) {
      setMemberStatus({
        email,
        status: 'error',
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred');
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (step === 'organization') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Set Up Your Organization</h2>
        <form onSubmit={handleOrganizationSubmit} className="space-y-4">
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !orgName}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add Team Member</h2>
      <form onSubmit={handleAddTeamMember} className="space-y-4">
        <div className="space-y-3">
          {emailInputs.map((input) => (
            <div key={input.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="email"
                  value={input.value}
                  onChange={(e) => handleEmailChange(input.id, e.target.value)}
                  onBlur={(e) => handleEmailChange(input.id, e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                    ${input.error ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter team member's email"
                  disabled={isAddingMembers}
                />
                {input.error && (
                  <p className="mt-1 text-sm text-red-600">{input.error}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveEmailInput(input.id)}
                className={`mt-1 p-2 text-gray-400 hover:text-gray-600 focus:outline-none
                  ${isAddingMembers ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isAddingMembers}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddEmailInput}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isAddingMembers}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Email
          </button>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role (Optional)
          </label>
          <input
            type="text"
            id="role"
            value={teamMemberRole}
            onChange={(e) => setTeamMemberRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g. Recruiter, Hiring Manager"
            disabled={isAddingMembers}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isAddingMembers || emailInputs.every(input => !input.value.trim())}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isAddingMembers ? 'Adding Members...' : 'Add Members'}
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isAddingMembers}
          >
            Complete Setup
          </button>
        </div>
      </form>

      {memberStatus && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Member Status:</h3>
          <div className={`flex items-center p-2 rounded-md ${
            memberStatus.status === 'success' 
              ? 'bg-green-50' 
              : memberStatus.status === 'error'
              ? 'bg-red-50'
              : 'bg-gray-50'
          }`}>
            {memberStatus.status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            ) : memberStatus.status === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
            )}
            <div>
              <span className="font-medium text-sm">
                {memberStatus.email}
              </span>
              {memberStatus.message && (
                <span className={`ml-2 text-sm ${
                  memberStatus.status === 'success' 
                    ? 'text-green-700' 
                    : memberStatus.status === 'error'
                    ? 'text-red-700'
                    : 'text-gray-700'
                }`}>
                  {memberStatus.message}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}; 