import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Briefcase, 
  GraduationCap, 
  Linkedin, 
  Twitter, 
  Trophy, 
  User, 
  LogOut,
  Building2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import { useApolloClient } from '@apollo/client';
import { LOGOUT } from '@/graphql/Auth';

interface UserProfileDropdownProps {
  className?: string;
}

const UserProfileDropdown = ({ className }: UserProfileDropdownProps) => {
  const client = useApolloClient();
  const { user, logout } = useAuthStore();
  const { organization } = useOrganizationStore();

  const handleLogout = async () => {
    try {
      await client.mutate({
        mutation: LOGOUT
      });
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{user.name}</h4>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {organization && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building2 className="mr-1 h-3 w-3" />
                  {organization.name}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex w-full cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </Link>
        </DropdownMenuItem>

        {/* {organization && (
          <DropdownMenuItem asChild>
            <Link to="/organization" className="flex w-full cursor-pointer items-center">
              <Building2 className="mr-2 h-4 w-4" />
              <span>Organization Settings</span>
            </Link>
          </DropdownMenuItem>
        )} */}
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
