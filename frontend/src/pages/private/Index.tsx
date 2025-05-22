import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
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
import { ArrowRight, Clipboard, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_DASHBOARD_ANALYTICS } from '@/graphql/Meeting';

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  date: Date;
  time: string;
  type: 'technical' | 'behavioral' | 'culture';
}

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedDateInterviews, setSelectedDateInterviews] = useState<Interview[]>([]);

  const { data: dashboardData, loading } = useQuery(GET_DASHBOARD_ANALYTICS);

  return (
    <TransitionLayout>
      <Navbar />
      <main className="pt-24 px-6 pb-16 container mx-auto">
        <section className="animate-fade-up">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-hirewise-950 mb-2">Welcome back</h1>
            <p className="text-hirewise-600 max-w-lg">
              Your AI-powered hiring assistant is ready to help you find and evaluate the perfect candidates for your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnalyticsCard 
              title="Interviews This Week" 
              value={loading ? "..." : dashboardData?.getDashboardAnalytics?.interviewsThisWeek.toString() || "0"} 
              change={{ value: "0%", positive: true }}
              chart={true}
              delay="100"
            />
            <AnalyticsCard 
              title="Interviews This Month" 
              value={loading ? "..." : dashboardData?.getDashboardAnalytics?.interviewsThisMonth.toString() || "0"} 
              change={{ value: "0%", positive: true }}
              chart={true}
              delay="100"
            />
            <AnalyticsCard 
              title="Active Jobs" 
              value={loading ? "..." : dashboardData?.getDashboardAnalytics?.activeJobs.toString() || "0"}
              chart={true}
              delay="200"
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-fade-up animate-delay-100 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-hirewise-950">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionCard 
                icon={<Users size={22} />}
                title="Jobs"
                description="View all jobs"
                linkTo="/jobs"
              />
              <QuickActionCard 
                icon={<Clipboard size={22} />}
                title="Team"
                description="View all team members"
                linkTo="/team"
              />
            </div>
          </Card>
          
          <div className="space-y-6">
            <UpcomingInterviews 
              delay="200" 
              interviews={loading ? [] : dashboardData?.getDashboardAnalytics?.upcomingInterviews || []}
            />
          </div>
        </section>
      </main>
    </TransitionLayout>
  );
};

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
}

const QuickActionCard = ({ icon, title, description, linkTo }: QuickActionCardProps) => {
  return (
    <Link to={linkTo} className="group flex flex-col p-5 rounded-xl border border-gray-100 hover:border-hirewise-200 hover:shadow-md transition-all bg-white">
      <div className="w-12 h-12 rounded-lg bg-hirewise-100 flex items-center justify-center text-hirewise-600 mb-3 group-hover:bg-hirewise-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-medium text-hirewise-900 mb-1">{title}</h3>
      <p className="text-sm text-hirewise-500 mb-3">{description}</p>
      <div className="mt-auto flex items-center text-sm font-medium text-hirewise-600 group-hover:text-hirewise-800 transition-colors">
        <span>Get started</span>
        <ArrowRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

export default Index;
