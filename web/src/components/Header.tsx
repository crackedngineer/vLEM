import React from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/labs': return 'My Docker Labs';
      case '/templates': return 'Install Labs';
      case '/settings': return 'Settings';
      default: 
        if (location.pathname.startsWith('/lab/')) return 'Lab Details';
        if (location.pathname.startsWith('/build/')) return 'Building Lab';
        return 'Docker Labs';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
          <p className="text-sm text-muted-foreground">
            {location.pathname === '/' && 'Overview of your Docker lab environments'}
            {location.pathname === '/labs' && 'Manage your installed Docker labs'}
            {location.pathname === '/templates' && 'Browse and install new lab templates'}
            {location.pathname === '/settings' && 'Configure your Docker Labs settings'}
            {location.pathname.startsWith('/lab/') && 'Detailed view and management'}
            {location.pathname.startsWith('/build/') && 'Installation progress and logs'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search labs..."
              className="pl-10 w-64"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;