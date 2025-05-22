import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Interview {
  id: string;
  title: string;
  startTime: string;
}

interface UpcomingInterviewsProps {
  delay?: "100" | "200" | "300" | "400" | "500" | undefined;
  interviews?: Interview[];
}

const UpcomingInterviews = ({ delay, interviews = [] }: UpcomingInterviewsProps) => {
  return (
    <Card className={cn(
      "w-full",
      delay && `animate-scale-in animate-delay-${delay}`
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
        <Calendar className="w-4 h-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <div key={interview.id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <div className="text-sm font-medium">{interview.title}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(interview.startTime), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              No upcoming interviews
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingInterviews;
