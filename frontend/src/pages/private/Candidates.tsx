import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransitionLayout from '@/components/ui/TransitionLayout';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, ThumbsUp, ThumbsDown, Calendar, Video, Plus, Clock, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { format, isAfter, isBefore } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GET_JOB } from '@/graphql/Jobs';
import { SCHEDULE_INTERVIEW, GET_INTERVIEWS, UPDATE_INTERVIEW, DELETE_INTERVIEW, GET_MEETING_TRANSCRIPT } from '@/graphql/Meeting/index';
import { useAuthStore } from '@/store/authStore';
import { useApolloClient } from '@apollo/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizationStore } from '@/store/organizationStore';

interface Candidate {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  appliedDate: string;
  status: 'Pending' | 'Interviewed' | 'Rejected' | 'Hired';
  meetings: Meeting[];
}

interface Attendee {
  userId: string;
  displayName: string;
  email: string;
}

interface Meeting {
  id: string;
  meetingId: string;
  title: string;
  meetLink: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  status: string;
  hasTranscription: boolean;
  communicationSkillsScore?: number;
  cultureFitScore?: number;
  problemSolvingScore?: number;
  technicalSkillsScore?: number;
  transcriptionSummary?: string;
  createdAt: string;
  updatedAt: string;
  attendees: Attendee[];
  job: {
    id: string;
    title: string;
  };
  transcriptMessages?: TranscriptMessage[];
}

interface Scoreboard {
  technicalSkills: number;
  communicationSkills: number;
  problemSolving: number;
  cultureFit: number;
  averageScore: number;
  interviewer: string;
  notes: string;
}

interface TranscriptMessage {
  id: string;
  speaker: string;
  transcription_Data: string;
  transcription_end_time_milliseconds: string;
  transcription_start_time_milliseconds: string;
}

const meetingFormSchema = z.object({
  candidateName: z.string().min(1, 'Please enter candidate name'),
  candidateEmail: z.string().email('Please enter a valid email address'),
  title: z.string().min(1, 'Meeting title is required'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  attendees: z.array(z.string()).min(1, 'Please select at least one attendee'),
  timezone: z.string().default('UTC'),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true;
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

const Candidates = () => {
  const { id: jobId } = useParams();
  const { user } = useAuthStore();
  const { organization } = useOrganizationStore();
  const client = useApolloClient();
  const navigate = useNavigate();
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<null | { summary: string; transcript: TranscriptMessage[]; meetingTitle: string }>(null);
  const [transcriptLimit, setTranscriptLimit] = useState(10);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [transcriptPage, setTranscriptPage] = useState(1);

  // Generate time options for the schedule meeting form
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      label: new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  });

  const { data: jobData, loading: isJobLoading, error: jobError } = useQuery(GET_JOB, {
    variables: { organizationId: organization?.id, jobId },
    skip: !jobId,
  });

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      candidateName: '',
      candidateEmail: '',
      title: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      attendees: [user?.email || ''],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  // Redirect to jobs page if there's an error or no data
  useEffect(() => {
    if (!isJobLoading && (jobError || !jobData?.getJob)) {
      navigate('/jobs');
    }
  }, [isJobLoading, jobError, jobData, navigate]);

  const { data: interviewsData, loading: isInterviewsLoading, refetch: refetchInterviews } = useQuery(GET_INTERVIEWS, {
    variables: {
      input: {
        jobId,
        page,
        limit: 10,
      },
    },
    skip: !jobId,
  });

  const [scheduleInterview, { loading: isScheduling }] = useMutation(SCHEDULE_INTERVIEW);
  const [updateInterview, { loading: isUpdating }] = useMutation(UPDATE_INTERVIEW);
  const [deleteInterview, { loading: isDeleting }] = useMutation(DELETE_INTERVIEW);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isScheduleMeetingOpen) {
      form.reset({
        candidateName: '',
        candidateEmail: '',
        title: jobData?.getJob?.title || '',
        date: new Date(),
        startTime: '',
        endTime: '',
        attendees: [user?.email || ''],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [isScheduleMeetingOpen, form, user?.email, jobData?.getJob?.title]);

  const interviews = interviewsData?.getInterviews?.interviews || [];
  const totalPages = interviewsData?.getInterviews?.totalPages || 1;

  const handleScheduleMeeting = async (data: MeetingFormValues) => {
    try {
      const result = await scheduleInterview({
        variables: {
          input: {
            jobId: jobId,
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
            title: data.title,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            attendees: data.attendees,
            timezone: data.timezone,
          },
        },
      });

      if (result.data?.scheduleInterview) {
        toast.success('Interview scheduled successfully');
        setIsScheduleMeetingOpen(false);
        form.reset();
        await refetchInterviews();
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error(error.message || 'Failed to schedule interview');
    }
  };

  const handleUpdateMeeting = async (data: MeetingFormValues) => {
    if (!selectedMeeting) return;

    try {
      const result = await updateInterview({
        variables: {
          input: {
            eventId: selectedMeeting.meetingId,
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
            title: data.title,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            attendees: data.attendees,
            timezone: data.timezone,
          },
        },
      });

      if (result.data?.updateInterview) {
        toast.success('Interview updated successfully');
        setIsEditMeetingOpen(false);
        setSelectedMeeting(null);
        form.reset();
        await refetchInterviews();
      }
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast.error(error.message || 'Failed to update interview');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      const result = await deleteInterview({
        variables: {
          input: {
            eventId: meetingToDelete.meetingId,
          },
        },
      });

      if (result.data?.deleteInterview?.success) {
        toast.success('Interview deleted successfully');
        setIsDeleteDialogOpen(false);
        setMeetingToDelete(null);
        await refetchInterviews();
      }
    } catch (error) {
      console.error('Failed to delete interview:', error);
      toast.error(error.message || 'Failed to delete interview');
    }
  };

  const openEditDialog = (meeting: Meeting) => {
    const candidate = meeting.attendees.find((a) => !a.userId);
    setSelectedMeeting(meeting);
    form.reset({
      candidateName: candidate?.displayName || '',
      candidateEmail: candidate?.email || '',
      title: meeting.title,
      date: new Date(meeting.startTime),
      startTime: format(new Date(meeting.startTime), 'HH:mm'),
      endTime: format(new Date(meeting.endTime), 'HH:mm'),
      attendees: meeting.attendees.filter(a => a.userId).map(a => a.email),
      timezone: meeting.timeZone,
    });
    setIsEditMeetingOpen(true);
  };

  const openDeleteDialog = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setIsDeleteDialogOpen(true);
  };

  const { data: transcriptData, loading: isTranscriptLoading } = useQuery(GET_MEETING_TRANSCRIPT, {
    variables: {
      input: {
        meetingId: selectedMeetingId,
        page: transcriptPage,
        limit: transcriptLimit,
      },
    },
    skip: !selectedMeetingId || !isTranscriptOpen,
  });

  const openTranscriptDialog = (meeting: Meeting) => {
    setSelectedMeetingId(meeting.id);
    setTranscriptPage(1);
    setSelectedTranscript({
      summary: meeting.transcriptionSummary || '',
      transcript: [],
      meetingTitle: meeting.title,
    });
    setIsTranscriptOpen(true);
  };

  // Update transcript when data changes
  useEffect(() => {
    if (transcriptData?.getMeetingTranscript) {
      const { transcript, total, hasMore } = transcriptData.getMeetingTranscript;
      setSelectedTranscript(prev => ({
        ...prev!,
        transcript: transcriptPage === 1 ? (transcript || []) : [...(prev?.transcript || []), ...(transcript || [])],
        total,
        hasMore,
      }));
    }
  }, [transcriptData, transcriptPage]);

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        {jobData?.getJob && (
          <div className="mb-8 animate-fade-up">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-2xl font-semibold text-hirewise-950">{jobData.getJob.title}</h2>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{jobData.getJob.type}</Badge>
                        <Badge variant="outline">{jobData.getJob.location}</Badge>
                        <Badge variant="outline">{jobData.getJob.status}</Badge>
                      </div>
                    </div>
                    <p className="text-hirewise-600 line-clamp-2">
                      {jobData.getJob.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm text-hirewise-600">Created by</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={jobData.getJob.createdBy.avatar || undefined} alt={jobData.getJob.createdBy.name} />
                          <AvatarFallback>{jobData.getJob.createdBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{jobData.getJob.createdBy.name.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm text-hirewise-600">Team Members</span>
                      <div className="flex -space-x-2">
                        {jobData.getJob.teamMembers.map((member) => (
                          <Avatar key={member.user.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.user.avatar || undefined} alt={member.user.name} />
                            <AvatarFallback>{member.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <section className="animate-fade-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-hirewise-950 mb-2">Candidates</h1>
              <p className="text-hirewise-600 max-w-lg">
                Manage candidates and schedule interviews for this position.
              </p>
            </div>
            <Button className="gap-2" onClick={() => setIsScheduleMeetingOpen(true)}>
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>

          {isInterviewsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((meeting) => (
                  <CandidateCard
                    key={meeting.id}
                    meeting={meeting}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    onViewTranscript={() => openTranscriptDialog(meeting)}
                  />
                ))}
              </div>

              {interviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-hirewise-600">No candidates found</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <Dialog open={isScheduleMeetingOpen} onOpenChange={setIsScheduleMeetingOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview Meeting</DialogTitle>
              <DialogDescription>
                Schedule a new interview meeting with a candidate.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleScheduleMeeting)} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  placeholder="Enter candidate name"
                  className={cn(
                    form.formState.errors.candidateName && "border-red-500"
                  )}
                  {...form.register('candidateName')}
                />
                {form.formState.errors.candidateName && (
                  <p className="text-sm text-red-500">{form.formState.errors.candidateName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="candidateEmail">Candidate Email</Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  placeholder="Enter candidate email"
                  className={cn(
                    form.formState.errors.candidateEmail && "border-red-500"
                  )}
                  {...form.register('candidateEmail')}
                />
                {form.formState.errors.candidateEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.candidateEmail.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title (Job title)</Label>
                <Input
                  id="title"
                  placeholder="Enter meeting title"
                  className={cn(
                    form.formState.errors.title && "border-red-500"
                  )}
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !form.watch('date') && "text-muted-foreground",
                        form.formState.errors.date && "border-red-500"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch('date') ? format(form.watch('date'), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch('date')}
                      onSelect={(date) => {
                        if (date) {
                          form.setValue('date', date, { shouldValidate: true });
                        }
                      }}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue('startTime', value, { shouldValidate: true });
                      // If end time is before or equal to start time, reset it
                      const endTime = form.watch('endTime');
                      if (endTime && value >= endTime) {
                        form.setValue('endTime', '', { shouldValidate: true });
                      }
                    }}
                    value={form.watch('startTime')}
                  >
                    <SelectTrigger
                      id="startTime"
                      className={cn(
                        form.formState.errors.startTime && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select
                    onValueChange={(value) => form.setValue('endTime', value, { shouldValidate: true })}
                    value={form.watch('endTime')}
                  >
                    <SelectTrigger
                      id="endTime"
                      className={cn(
                        form.formState.errors.endTime && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {timeOptions
                        .filter(time => {
                          const startTime = form.watch('startTime');
                          return !startTime || time.value > startTime;
                        })
                        .map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attendees">Interviewers</Label>
                <Select
                  onValueChange={(value) => {
                    const currentAttendees = form.watch('attendees');
                    if (!currentAttendees.includes(value)) {
                      form.setValue('attendees', [...currentAttendees, value], { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add interviewers" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobData?.getJob?.teamMembers.map((member) => (
                      <SelectItem
                        key={member.user.id}
                        value={member.user.email}
                        disabled={form.watch('attendees').includes(member.user.email)}
                      >
                        <div className="flex items-center gap-2">
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user.name}
                              className="w-4 h-4 rounded-full"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px]">
                              {member.user.name.charAt(0)}
                            </div>
                          )}
                          <span>{member.user.name}</span>
                          <span className="text-muted-foreground text-xs">({member.user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('attendees').map((email) => {
                    const member = jobData?.getJob?.teamMembers.find(m => m.user.email === email);
                    const isCurrentUser = email === user?.email;
                    return (
                      <Badge
                        key={email}
                        variant={isCurrentUser ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {member ? (
                          <div className="flex items-center gap-1">
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.name}
                                className="w-3 h-3 rounded-full"
                              />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center text-[8px]">
                                {member.user.name.charAt(0)}
                              </div>
                            )}
                            <span>{member.user.name}</span>
                            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                          </div>
                        ) : (
                          email
                        )}
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentAttendees = form.watch('attendees');
                              form.setValue(
                                'attendees',
                                currentAttendees.filter((e) => e !== email),
                                { shouldValidate: true }
                              );
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                {form.formState.errors.attendees && (
                  <p className="text-sm text-red-500">{form.formState.errors.attendees.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsScheduleMeetingOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isScheduling}>
                  {isScheduling ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Meeting Dialog */}
        <Dialog open={isEditMeetingOpen} onOpenChange={(open) => {
          setIsEditMeetingOpen(open);
          if (!open) {
            setSelectedMeeting(null);
            form.reset();
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Interview Meeting</DialogTitle>
              <DialogDescription>
                Update the interview meeting details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdateMeeting)} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  placeholder="Enter candidate name"
                  className={cn(
                    form.formState.errors.candidateName && "border-red-500"
                  )}
                  {...form.register('candidateName')}
                />
                {form.formState.errors.candidateName && (
                  <p className="text-sm text-red-500">{form.formState.errors.candidateName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="candidateEmail">Candidate Email</Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  placeholder="Enter candidate email"
                  className={cn(
                    form.formState.errors.candidateEmail && "border-red-500"
                  )}
                  {...form.register('candidateEmail')}
                />
                {form.formState.errors.candidateEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.candidateEmail.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title (Job title)</Label>
                <Input
                  id="title"
                  placeholder="Enter meeting title"
                  className={cn(
                    form.formState.errors.title && "border-red-500"
                  )}
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !form.watch('date') && "text-muted-foreground",
                        form.formState.errors.date && "border-red-500"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch('date') ? format(form.watch('date'), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch('date')}
                      onSelect={(date) => {
                        if (date) {
                          form.setValue('date', date, { shouldValidate: true });
                        }
                      }}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue('startTime', value, { shouldValidate: true });
                      // If end time is before or equal to start time, reset it
                      const endTime = form.watch('endTime');
                      if (endTime && value >= endTime) {
                        form.setValue('endTime', '', { shouldValidate: true });
                      }
                    }}
                    value={form.watch('startTime')}
                  >
                    <SelectTrigger
                      id="startTime"
                      className={cn(
                        form.formState.errors.startTime && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select
                    onValueChange={(value) => form.setValue('endTime', value, { shouldValidate: true })}
                    value={form.watch('endTime')}
                  >
                    <SelectTrigger
                      id="endTime"
                      className={cn(
                        form.formState.errors.endTime && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {timeOptions
                        .filter(time => {
                          const startTime = form.watch('startTime');
                          return !startTime || time.value > startTime;
                        })
                        .map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attendees">Interviewers</Label>
                <Select
                  onValueChange={(value) => {
                    const currentAttendees = form.watch('attendees');
                    if (!currentAttendees.includes(value)) {
                      form.setValue('attendees', [...currentAttendees, value], { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add interviewers" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobData?.getJob?.teamMembers.map((member) => (
                      <SelectItem
                        key={member.user.id}
                        value={member.user.email}
                        disabled={form.watch('attendees').includes(member.user.email)}
                      >
                        <div className="flex items-center gap-2">
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user.name}
                              className="w-4 h-4 rounded-full"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px]">
                              {member.user.name.charAt(0)}
                            </div>
                          )}
                          <span>{member.user.name}</span>
                          <span className="text-muted-foreground text-xs">({member.user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('attendees').map((email) => {
                    const member = jobData?.getJob?.teamMembers.find(m => m.user.email === email);
                    const isCurrentUser = email === user?.email;
                    return (
                      <Badge
                        key={email}
                        variant={isCurrentUser ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {member ? (
                          <div className="flex items-center gap-1">
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.name}
                                className="w-3 h-3 rounded-full"
                              />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center text-[8px]">
                                {member.user.name.charAt(0)}
                              </div>
                            )}
                            <span>{member.user.name}</span>
                            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                          </div>
                        ) : (
                          email
                        )}
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentAttendees = form.watch('attendees');
                              form.setValue(
                                'attendees',
                                currentAttendees.filter((e) => e !== email),
                                { shouldValidate: true }
                              );
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                {form.formState.errors.attendees && (
                  <p className="text-sm text-red-500">{form.formState.errors.attendees.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setIsEditMeetingOpen(false);
                  setSelectedMeeting(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the interview meeting
                and remove it from Google Calendar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setMeetingToDelete(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMeeting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Transcript Dialog */}
        <Dialog open={isTranscriptOpen} onOpenChange={(open) => {
          setIsTranscriptOpen(open);
          if (!open) {
            setSelectedMeetingId(null);
            setTranscriptPage(1);
            setSelectedTranscript(null);
          }
        }}>
          <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transcript - {selectedTranscript?.meetingTitle}</DialogTitle>
              <DialogDescription>
                <div className="mb-4">
                  {/* <h4 className="font-medium mb-1">Interview Summary</h4> */}
                  <p className="text-muted-foreground text-sm">{selectedTranscript?.summary}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {isTranscriptLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedTranscript?.transcript.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transcript available for this meeting.
                </div>
              ) : (
                    <>
                      <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                        {selectedTranscript?.transcript.map((msg) => (
                          <div key={msg.id} className="border rounded p-2 bg-muted">
                            <div className="font-semibold text-xs text-hirewise-700 mb-1">{msg.speaker}</div>
                            <div className="text-sm whitespace-pre-line">{msg.transcription_Data}</div>
                          </div>
                        ))}
                      </div>
                  {selectedTranscript?.hasMore && (
                    <Button 
                      variant="outline" 
                      onClick={() => setTranscriptPage(p => p + 1)}
                      disabled={isTranscriptLoading}
                      className="w-full"
                    >
                      {isTranscriptLoading ? 'Loading...' : 'Load More'}
                    </Button>
                  )}
                </>
              )}
            </div>
            {/* <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsTranscriptOpen(false);
                setSelectedMeetingId(null);
                setTranscriptPage(1);
                setSelectedTranscript(null);
              }}>
                Close
              </Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </main>
    </TransitionLayout>
  );
};

const CandidateCard = ({
  meeting,
  onEdit,
  onDelete,
  onViewTranscript
}: {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onViewTranscript: () => void;
}) => {
  const candidate = meeting.attendees.find((a) => !a.userId);
  const interviewers = meeting.attendees.filter((a): a is Attendee => !!a.userId);
  const isCompleted = meeting.hasTranscription;
  const hasScores = isCompleted && meeting.communicationSkillsScore !== undefined;
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);

  let status: 'Pending' | 'Ongoing' | 'Interviewed';
  if (isCompleted) {
    status = 'Interviewed';
  } else {
    status = 'Pending';
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{candidate?.displayName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-medium">{candidate?.displayName}</CardTitle>
            <CardDescription className="text-sm">
              {candidate?.email}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'Interviewed' ? 'default' : 'secondary'}>
            {status}
          </Badge>
          {status !== 'Interviewed' && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(meeting)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(meeting)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {format(new Date(meeting.startTime), "PPP")} - {format(new Date(meeting.startTime), "p")} - {format(new Date(meeting.endTime), "p")}
                </span>
              </div>
              <img src="/svgs/google-meet.svg" alt="Google Meet" className="h-10 w-10" />
            </div>

            {meeting.meetLink && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Video className="h-4 w-4 text-muted-foreground" />
                <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {meeting.meetLink}
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {interviewers.map((interviewer) => (
                <Badge key={interviewer.userId} variant="secondary" className="flex items-center gap-1">
                  {interviewer.displayName}
                </Badge>
              ))}
            </div>

            {hasScores && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium text-sm">Interview Scores</h4>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Technical Skills</span>
                      <span className="font-medium">{meeting.technicalSkillsScore}% - {getScoreLabel(meeting.technicalSkillsScore)}</span>
                    </div>
                    <Progress value={meeting.technicalSkillsScore} className="bg-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Communication Skills</span>
                      <span className="font-medium">{meeting.communicationSkillsScore}% - {getScoreLabel(meeting.communicationSkillsScore)}</span>
                    </div>
                    <Progress value={meeting.communicationSkillsScore} className="bg-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Problem Solving</span>
                      <span className="font-medium">{meeting.problemSolvingScore}% - {getScoreLabel(meeting.problemSolvingScore)}</span>
                    </div>
                    <Progress value={meeting.problemSolvingScore} className="bg-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Culture Fit</span>
                      <span className="font-medium">{meeting.cultureFitScore}% - {getScoreLabel(meeting.cultureFitScore)}</span>
                    </div>
                    <Progress value={meeting.cultureFitScore} className="bg-gray-200" />
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="mt-4 space-y-2">
                {meeting.transcriptionSummary && (
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium mb-1">Summary</h4>
                    <p className="line-clamp-3">{meeting.transcriptionSummary}</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => onViewTranscript()}
                  disabled={!meeting.hasTranscription}
                >
                  {meeting.hasTranscription ? 'View Transcript' : 'Transcript Not Available'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Candidates;
