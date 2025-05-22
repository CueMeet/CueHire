import React, { useState } from 'react';
import TransitionLayout from '@/components/ui/TransitionLayout';
import Navbar from '@/components/Navbar';
import AnalyticsCard from '@/components/Dashboard/AnalyticsCard';
import UpcomingInterviews from '@/components/Dashboard/UpcomingInterviews';
import CandidateScorecard from '@/components/Dashboard/CandidateScorecard';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Clipboard, GraduationCap, Users, Plus, Briefcase, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from '@/store/organizationStore';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { X } from 'lucide-react';
import { CREATE_JOB, GET_JOBS } from '@/graphql/Jobs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface JobTeamMember {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  teamMembers: JobTeamMember[];
  createdAt: Date;
  status: 'Open' | 'Closed' | 'Draft';
}

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  teamMembers?: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const { organization } = useOrganizationStore();
  const { user } = useAuthStore();
  const { data: jobsData, loading, error, refetch } = useQuery(GET_JOBS, {
    variables: { organizationId: organization?.id },
    skip: !organization?.id,
  });
  const [createJob, { loading: isCreating }] = useMutation(CREATE_JOB, {
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    teamMembers: user ? [user.id] : [],
    status: 'Draft'
  });

  const [isTeamPopoverOpen, setIsTeamPopoverOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Organization store and Apollo client
  const { members, fetchMembers } = useOrganizationStore();
  const client = useApolloClient();

  // Fetch members when dialog opens
  React.useEffect(() => {
    if (isCreateJobOpen && organization?.id) {
      fetchMembers(client, organization.id);
    }
  }, [isCreateJobOpen, organization, fetchMembers, client]);

  // Handle team member selection
  const handleTeamMembersSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    // Ensure logged-in user is always included
    const teamMembers = user ? [...new Set([user.id, ...selected])] : selected;
    setNewJob({ ...newJob, teamMembers });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newJob.title?.trim()) {
      errors.title = 'Job title is required';
    } else if (newJob.title.length < 3) {
      errors.title = 'Job title must be at least 3 characters';
    }
    
    if (!newJob.description?.trim()) {
      errors.description = 'Job description is required';
    } else if (newJob.description.length < 50) {
      errors.description = 'Job description must be at least 50 characters';
    }
    
    if (!newJob.location?.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!newJob.type) {
      errors.type = 'Job type is required';
    }
    
    if (!newJob.teamMembers?.length) {
      errors.teamMembers = 'At least one team member is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateJob = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      const result = await createJob({
        variables: {
          organizationId: organization.id,
          input: {
            title: newJob.title.trim(),
            description: newJob.description.trim(),
            location: newJob.location.trim(),
            type: newJob.type,
            teamMembers: newJob.teamMembers,
            status: newJob.status || 'Draft'
          },
        },
      });
      
      if (result.data?.createJob) {
        toast.success('Job created successfully');
        setNewJob({
          title: '',
          description: '',
          location: '',
          type: 'Full-time',
          teamMembers: user ? [user.id] : [],
          status: 'Draft'
        });
        setFormErrors({});
        setIsCreateJobOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog is closed, but keep logged-in user
      setNewJob({
        title: '',
        description: '',
        location: '',
        type: 'Full-time',
        teamMembers: user ? [user.id] : [],
        status: 'Draft'
      });
      setFormErrors({});
    }
    setIsCreateJobOpen(open);
  };

  if (error) {
    return (
      <TransitionLayout>
        <Navbar />
        <main className="pt-24 px-6 pb-16 container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Jobs</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </TransitionLayout>
    );
  }

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        <section className="animate-fade-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-hirewise-950 mb-2">
                Jobs
              </h1>
              <p className="text-muted-foreground">
                Manage and track your job postings
              </p>
            </div>
            <Dialog open={isCreateJobOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Job</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new job posting.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => {
                        setNewJob({ ...newJob, title: e.target.value });
                        if (formErrors.title) {
                          setFormErrors({ ...formErrors, title: undefined });
                        }
                      }}
                      placeholder="e.g. Senior Frontend Engineer"
                      className={cn(formErrors.title && "border-destructive")}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-destructive">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => {
                        setNewJob({ ...newJob, description: e.target.value });
                        if (formErrors.description) {
                          setFormErrors({ ...formErrors, description: undefined });
                        }
                      }}
                      placeholder="Enter the job description..."
                      className={cn("min-h-[150px]", formErrors.description && "border-destructive")}
                    />
                    {formErrors.description && (
                      <p className="text-sm text-destructive">{formErrors.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => {
                          setNewJob({ ...newJob, location: e.target.value });
                          if (formErrors.location) {
                            setFormErrors({ ...formErrors, location: undefined });
                          }
                        }}
                        placeholder="e.g. Remote, New York"
                        className={cn(formErrors.location && "border-destructive")}
                      />
                      {formErrors.location && (
                        <p className="text-sm text-destructive">{formErrors.location}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Job Type</Label>
                      <select
                        id="type"
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                          formErrors.type && "border-destructive"
                        )}
                        value={newJob.type}
                        onChange={(e) => {
                          setNewJob({ ...newJob, type: e.target.value as Job['type'] });
                          if (formErrors.type) {
                            setFormErrors({ ...formErrors, type: undefined });
                          }
                        }}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                      {formErrors.type && (
                        <p className="text-sm text-destructive">{formErrors.type}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="teamMembers">Team Members</Label>
                    <Popover open={isTeamPopoverOpen} onOpenChange={setIsTeamPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div
                          className={cn(
                            "flex flex-wrap gap-1 min-h-[50px] border border-input rounded-md px-3 py-2 bg-background cursor-text",
                            formErrors.teamMembers && "border-destructive"
                          )}
                          onClick={() => setIsTeamPopoverOpen(true)}
                        >
                          {newJob.teamMembers && newJob.teamMembers.length > 0 ? (
                            newJob.teamMembers.map((id) => {
                              const member = members.find((m) => m.user.id === id);
                              return member ? (
                                <span key={id} className="flex items-center gap-1 bg-accent px-2 py-1 rounded text-sm">
                                  {member.user.email}
                                  {member.user.id === user?.id ? (
                                    <span className="ml-1 text-muted-foreground">(You)</span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="ml-1 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setNewJob({
                                          ...newJob,
                                          teamMembers: newJob.teamMembers!.filter((mid) => mid !== id),
                                        });
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground text-sm">Select team members...</span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0">
                        <Command>
                          <CommandInput placeholder="Search members..." />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No members found.</CommandEmpty>
                            {members
                              .filter((member) =>
                                // Only show members that are not the logged-in user and not already selected
                                member.user.id !== user?.id && !newJob.teamMembers?.includes(member.user.id)
                              )
                              .map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={member.user.email}
                                  onSelect={() => {
                                    // Ensure logged-in user is always included
                                    const teamMembers = user ? [...new Set([user.id, ...(newJob.teamMembers || []), member.user.id])] : [...(newJob.teamMembers || []), member.user.id];
                                    setNewJob({
                                      ...newJob,
                                      teamMembers,
                                    });
                                    setIsTeamPopoverOpen(false);
                                  }}
                                >
                                  {member.user.email}
                                </CommandItem>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formErrors.teamMembers && (
                      <p className="text-sm text-destructive">{formErrors.teamMembers}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateJob} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Job'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-20" />
                        <div className="h-6 bg-muted rounded w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !jobsData?.getJobs?.length ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job posting to start hiring
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobsData.getJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/candidates/${job.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Briefcase className="h-3 w-3" />
                          {job.type}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {job.teamMembers.length} members
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </TransitionLayout>
  );
};

export default Jobs;
