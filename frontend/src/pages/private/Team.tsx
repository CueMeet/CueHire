import React, { useState, useEffect } from "react";
import TransitionLayout from '@/components/ui/TransitionLayout';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Shield, UserPlus, Loader2 } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';
import { useApolloClient } from '@apollo/client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Select from 'react-select';
import { useMutation } from '@apollo/client';
import { ADD_TEAM_MEMBER } from '@/graphql/Auth';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

const roleOptions = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

const Team = () => {
  const [addTeamMember, { loading: isAddingMember }] = useMutation(ADD_TEAM_MEMBER);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Organization store and Apollo client
  const { organization, members, isLoading, error, fetchMembers } = useOrganizationStore();
  const client = useApolloClient();

  const clearDialogState = () => {
    setNewMemberEmail("");
    setSelectedRole(roleOptions[0]);
    setEmailError(null);
  };

  // Fetch members when component mounts
  useEffect(() => {
    if (organization?.id) {
      fetchMembers(client, organization.id);
    }
  }, [organization, fetchMembers, client]);

  // Email validation function
  const validateEmail = (email: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddMember = async () => {
    if (!organization?.id) {
      toast.error("Organization not found");
      return;
    }

    if (!validateEmail(newMemberEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const { data } = await addTeamMember({
        variables: {
          input: {
            email: newMemberEmail,
            organizationId: organization.id,
            role: selectedRole.value
          }
        }
      });

      if (!data || !data.addTeamMember.success) {
        throw new Error(data?.addTeamMember?.error || 'Failed to add team member');
      }

      toast.success("Team member added successfully");
      setIsAddMemberDialogOpen(false);
      clearDialogState();
      // Refresh members list
      fetchMembers(client, organization.id);
    } catch (error) {
      toast.error(error.message || "Failed to add team member");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'destructive';
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: TeamMember['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Pending':
        return 'warning';
      case 'Inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMemberDisplayName = (member: TeamMember) => {
    return member.user.name || member.user.email.split('@')[0];
  };

  const getMemberInitials = (member: TeamMember) => {
    if (member.user.name) {
      return member.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return member.user.email.slice(0, 2).toUpperCase();
  };

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        <section className="animate-fade-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-hirewise-950 mb-2">
                Team Members
              </h1>
              <p className="text-muted-foreground">
                Manage your team members and their roles
              </p>
            </div>
            <Dialog 
              open={isAddMemberDialogOpen} 
              onOpenChange={(open) => {
                setIsAddMemberDialogOpen(open);
                if (!open) {
                  clearDialogState();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to join your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        if (e.target.value === "" || validateEmail(e.target.value)) {
                          setEmailError(null);
                        } else {
                          setEmailError("Please enter a valid email address.");
                        }
                      }}
                    />
                    {emailError && (
                      <span className="text-sm text-red-500 mt-1">{emailError}</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      id="role"
                      value={selectedRole}
                      onChange={(option) => setSelectedRole(option || roleOptions[0])}
                      options={roleOptions}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isSearchable={false}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '40px',
                          borderColor: 'hsl(var(--input))',
                          backgroundColor: 'hsl(var(--background))',
                          boxShadow: 'none',
                          outline: 'none',
                          '&:hover': {
                            borderColor: 'hsl(var(--input))',
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? 'hsl(var(--accent))'
                            : 'transparent',
                          color: state.isFocused
                            ? 'hsl(var(--accent-foreground))'
                            : 'hsl(var(--foreground))',
                          '&:active': {
                            backgroundColor: 'hsl(var(--accent))',
                          },
                        }),
                        dropdownIndicator: (base) => ({
                          ...base,
                          padding: '6px',
                          outline: 'none',
                          boxShadow: 'none',
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          outline: 'none',
                          boxShadow: 'none',
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          outline: 'none',
                          boxShadow: 'none',
                        }),
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!newMemberEmail || !!emailError || isAddingMember}
                  >
                    {isAddingMember ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !members || members.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No Team Members Yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Start building your team by adding your first team member using the button above.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => {
                if (!member) return null;

                return (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            {member.user.avatar ? (
                              <AvatarImage src={member.user.avatar} alt={member.user.name} />
                            ) : null}
                            <AvatarFallback>
                              {getMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">
                              {member.user.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {member.user.email}
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                        {/* <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge> */}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                            <Shield className="h-3 w-3" />
                            {member.role}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            Joined {formatDate(member.createdAt)}
                          </Badge>
                        </div>
                        {/* <div className="flex justify-end">
                          <Button variant="ghost" size="sm">
                            Manage Role
                          </Button>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </TransitionLayout>
  );
};

export default Team; 