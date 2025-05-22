import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Search, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import UserProfileDropdown from './UserProfileDropdown';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center">
            <div className="font-extrabold text-2xl tracking-tight">CueHire</div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <NavItem href="/" active={location.pathname === '/'}>Dashboard</NavItem>
            <NavItem href="/jobs" active={location.pathname === '/jobs'}>Jobs</NavItem>
            <NavItem href="/team" active={location.pathname === '/team'}>Team</NavItem>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {/* <button className="p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
            <Search size={18} />
          </button>
          <Link to="/calendar" className="p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
            <Calendar size={18} />
          </Link>
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors">
            <Settings size={18} />
          </button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mr-2"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ href, children, active }: NavItemProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "inline-flex items-center py-2 text-sm font-medium transition-colors",
        active 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;
