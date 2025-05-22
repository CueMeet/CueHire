
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TransitionLayoutProps {
  children: ReactNode;
  className?: string;
}

const TransitionLayout = ({ children, className }: TransitionLayoutProps) => {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
};

export default TransitionLayout;
