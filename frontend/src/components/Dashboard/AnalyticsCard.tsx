import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive?: boolean;
  };
  chart?: boolean;
  className?: string;
  delay?: "100" | "200" | "300" | "400" | "500" | undefined;
}

const sampleData = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 14 },
  { name: 'Apr', value: 22 },
  { name: 'May', value: 25 },
  { name: 'Jun', value: 18 },
  { name: 'Jul', value: 30 },
];

const AnalyticsCard = ({ 
  title, 
  value, 
  change, 
  chart = false,
  className, 
  delay 
}: AnalyticsCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden bg-card border rounded-2xl p-6",
      delay && `animate-scale-in animate-delay-${delay}`,
      className
    )}>
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline mt-2 mb-1">
          <div className="text-2xl font-semibold">{value}</div>
          {change && (
            <div className={cn(
              "ml-2 text-xs font-medium",
              change.positive ? "text-green-600" : "text-red-600"
            )}>
              {change.positive ? '↑' : '↓'} {change.value}
            </div>
          )}
        </div>
      </div>
      
      {chart && (
        <div className="h-16 mt-2 -mx-6 -mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sampleData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#627189" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#627189" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#627189" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsCard;
