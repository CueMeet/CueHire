import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CandidateScorecardProps {
  delay?: "100" | "200" | "300" | "400" | "500" | undefined;
}

const CandidateScorecard = ({ delay }: CandidateScorecardProps) => {
  return (
    <Card className={cn(
      "w-full",
      delay && `animate-scale-in animate-delay-${delay}`
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Candidate A
        </CardTitle>
        <Badge variant="secondary">Applied 2 days ago</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Candidate A" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div>
            <CardDescription>
              <span className="font-medium">Frontend Engineer</span> at Acme Corp
            </CardDescription>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Technical Skills
            </span>
            <span className="text-xs font-medium text-gray-500">85%</span>
          </div>
          <Progress value={85} />
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Communication Skills
            </span>
            <span className="text-xs font-medium text-gray-500">70%</span>
          </div>
          <Progress value={70} />
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Problem Solving
            </span>
            <span className="text-xs font-medium text-gray-500">90%</span>
          </div>
          <Progress value={90} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateScorecard;
