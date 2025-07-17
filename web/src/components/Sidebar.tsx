import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  List, 
  BookTemplate as Template, 
  Monitor, 
  Settings, 
  User,
  Activity,
  Database,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { id: '/', label: 'Dashboard', icon: Monitor },
    { id: '/labs', label: 'My Labs', icon: List },
    { id: '/templates', label: 'Install Labs', icon: Template },
    { id: '/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const recentActivity = [
    { action: 'Started', lab: 'Nginx Web Server', time: '2 min ago', status: 'success' },
    { action: 'Installed', lab: 'MySQL Database', time: '1 hour ago', status: 'success' },
    { action: 'Stopped', lab: 'Redis Cache', time: '3 hours ago', status: 'warning' }
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <button 
          onClick={() => handleNavigation('/')}
          className="flex items-center space-x-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Container className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Docker Labs</h1>
            <p className="text-xs text-muted-foreground">Lab Installer</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
        <div className="space-y-1">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.id)}
                className="w-full justify-start"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </div>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Quick Stats */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Running</span>
                </div>
                <Badge variant="default" className="text-xs">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Total Labs</span>
                </div>
                <Badge variant="outline" className="text-xs">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Container className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Containers</span>
                </div>
                <Badge variant="outline" className="text-xs">12</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">
                      {activity.action} {activity.lab}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={() => handleNavigation('/settings')}
          className="flex items-center space-x-3 w-full text-left hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors"
        >
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Docker User</p>
            <p className="text-xs text-muted-foreground">admin@localhost</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;