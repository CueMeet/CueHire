import React from 'react';
import TransitionLayout from '@/components/ui/TransitionLayout';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, GraduationCap, Linkedin, Mail, MapPin, Phone, Trophy, Twitter, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { organization } = useOrganizationStore();

  if (!user) return null;

  // Default metrics - these would come from your backend in a real implementation
  const metrics = {
    interviewsScheduled: 0,
    positionsFilled: 0,
    averageTimeToHire: '0 days',
    candidateSatisfaction: '0%'
  };

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-hirewise-950 mb-6">User Profile</h1>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {/* <TabsTrigger value="stats">Recruiter Stats</TabsTrigger> */}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>Your personal and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
                    <p className="text-muted-foreground mb-4">{user.role || 'Recruiter'}</p>
                    
                    <div className="w-full space-y-2 text-left">
                      {organization && (
                        <div className="flex items-center text-sm">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{organization.name}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.credentials && (
                        <div className="flex items-center text-sm">
                          <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.credentials}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {user.socialLinks && (
                      <div className="flex space-x-2">
                        {user.socialLinks.linkedin && (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        {user.socialLinks.twitter && (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4" />
                              Twitter
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* About Me */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                    <CardDescription>Your professional summary and recruiter score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-6">{user.about || 'No bio available'}</p>
                    
                    {user.recruiterScore !== undefined && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                            <span className="font-medium">Recruiter Score</span>
                          </div>
                          <span className="font-medium">{user.recruiterScore}/100</span>
                        </div>
                        <Progress value={user.recruiterScore} className="h-2" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Your recruiter score is calculated based on candidate satisfaction, 
                          hiring success rate, and interview efficiency.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">Interviews Scheduled</p>
                        <p className="text-2xl font-semibold">{metrics.interviewsScheduled}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">Positions Filled</p>
                        <p className="text-2xl font-semibold">{metrics.positionsFilled}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">Avg. Time to Hire</p>
                        <p className="text-2xl font-semibold">{metrics.averageTimeToHire}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">Candidate Satisfaction</p>
                        <p className="text-2xl font-semibold">{metrics.candidateSatisfaction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Recruiter Performance</CardTitle>
                  <CardDescription>Your recruiting metrics and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground mb-8">
                    Detailed statistics about your recruiting performance would appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Job Title</Label>
                        <Input id="role" defaultValue={user.role || ''} />
                      </div>
                      {organization && (
                        <div className="space-y-2">
                          <Label htmlFor="company">Organization</Label>
                          <Input id="company" defaultValue={organization.name} disabled />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue={user.location || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue={user.phone || ''} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="about">About Me</Label>
                        <Input id="about" defaultValue={user.about || ''} />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </TransitionLayout>
  );
};

export default ProfilePage;
