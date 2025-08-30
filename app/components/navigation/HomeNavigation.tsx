'use client';

import { useState } from 'react';
import { Home, ArrowLeft, LayoutDashboard, Users, CheckSquare, Calendar, MessageCircle, Settings, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';

interface HomeNavigationProps {
  className?: string;
  variant?: 'button' | 'breadcrumb' | 'dropdown';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main dashboard overview',
    color: 'text-blue-500',
  },
  {
    label: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
    description: 'Employee management',
    color: 'text-green-500',
  },
  {
    label: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    description: 'Task management',
    color: 'text-purple-500',
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    description: 'Calendar and events',
    color: 'text-orange-500',
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: MessageCircle,
    description: 'Team communication',
    color: 'text-teal-500',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System settings',
    color: 'text-gray-500',
  },
];

export default function HomeNavigation({ 
  className,
  variant = 'button',
  showLabel = false,
  size = 'md'
}: HomeNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentPage = navigationItems.find(item => 
    pathname && (pathname === item.href || pathname.startsWith(item.href + '/'))
  );

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  if (variant === 'breadcrumb') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/dashboard')}
          className="h-auto p-1 hover:text-foreground"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </Button>
        {currentPage && currentPage.href !== '/dashboard' && (
          <>
            <span>/</span>
            <span className="text-foreground font-medium">{currentPage.label}</span>
          </>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={cn("gap-2", className)}
          >
            {currentPage ? (
              <>
                <currentPage.icon className={getIconSize()} />
                {showLabel && <span>{currentPage.label}</span>}
              </>
            ) : (
              <>
                <Home className={getIconSize()} />
                {showLabel && <span>Navigate</span>}
              </>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {navigationItems.map((item) => {
              const isActive = pathname && (pathname === item.href || pathname.startsWith(item.href + '/'));
              
              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer",
                    isActive && "bg-muted font-medium"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home Page</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default button variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('/dashboard')}
        className={cn(
          "relative hover:bg-muted transition-colors",
          getButtonSize()
        )}
        title="Go to Dashboard"
      >
        <Home className={getIconSize()} />
      </Button>
      
      {showLabel && (
        <span className="text-sm font-medium">Dashboard</span>
      )}
      
      {pathname !== '/dashboard' && pathname !== '/' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
    </div>
  );
}
