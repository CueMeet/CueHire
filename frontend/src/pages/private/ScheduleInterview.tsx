
import React from 'react';
import TransitionLayout from '@/components/ui/TransitionLayout';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { CalendarPlus, Users, Video, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

const ScheduleInterview = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const handleSchedule = () => {
    toast.success(`Interview scheduled for ${date ? format(date, 'PPP') : 'selected date'} at 10:00 AM.`);
  };

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        <section className="animate-fade-up">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-hirewise-100 text-hirewise-800 text-xs font-medium mb-3">
              <CalendarPlus className="inline-block mr-1 h-3 w-3" />
              New Interview
            </div>
            <h1 className="text-3xl font-semibold text-hirewise-950 mb-2">Schedule Interview</h1>
            <p className="text-hirewise-600 max-w-lg">
              Set up a new candidate interview and send automated invitations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Details</CardTitle>
                  <CardDescription>
                    Enter the information for this interview session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="single" className="w-full">
                    <TabsList className="mb-6">
                      <TabsTrigger value="single">Single Interview</TabsTrigger>
                      <TabsTrigger value="batch">Batch Scheduling</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="single">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Interview Type</label>
                            <Select defaultValue="technical">
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">Technical Interview</SelectItem>
                                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                                <SelectItem value="initial">Initial Screening</SelectItem>
                                <SelectItem value="final">Final Round</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Position</label>
                            <Select defaultValue="frontend">
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="frontend">Frontend Engineer</SelectItem>
                                <SelectItem value="backend">Backend Engineer</SelectItem>
                                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                                <SelectItem value="productmanager">Product Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Candidate Name</label>
                          <Input placeholder="Enter candidate name" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Interview Method</label>
                            <Select defaultValue="video">
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video Call</SelectItem>
                                <SelectItem value="inperson">In Person</SelectItem>
                                <SelectItem value="phone">Phone Call</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Duration</label>
                            <Select defaultValue="60">
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Interviewers</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select interviewers" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alex">Alex Morgan</SelectItem>
                              <SelectItem value="jamie">Jamie Wilson</SelectItem>
                              <SelectItem value="taylor">Taylor Reed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Additional Notes</label>
                          <Textarea 
                            placeholder="Add any special instructions or topics to cover"
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="batch">
                      <div className="p-8 text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">Batch Scheduling</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                          Schedule multiple interviews at once by uploading a CSV file with candidate details.
                        </p>
                        <Button className="mt-4">Upload CSV Template</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-hirewise-600" />
                    Choose Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border mb-4"
                  />
                  
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium">Time Slots</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Button variant="outline" size="sm" className="justify-start">9:00 AM</Button>
                      <Button variant="outline" size="sm" className="justify-start">9:30 AM</Button>
                      <Button variant="outline" size="sm" className="justify-start bg-hirewise-100 border-hirewise-200">10:00 AM</Button>
                      <Button variant="outline" size="sm" className="justify-start">10:30 AM</Button>
                      <Button variant="outline" size="sm" className="justify-start">11:00 AM</Button>
                      <Button variant="outline" size="sm" className="justify-start">11:30 AM</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Video className="mr-2 h-5 w-5 text-hirewise-600" />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meeting Platform</label>
                      <Select defaultValue="zoom">
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                          <SelectItem value="gmeet">Google Meet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meeting Link (Optional)</label>
                      <Input placeholder="Paste meeting URL" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to auto-generate
                      </p>
                    </div>
                    
                    <Button onClick={handleSchedule} className="w-full mt-4">
                      <Check className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </TransitionLayout>
  );
};

export default ScheduleInterview;
